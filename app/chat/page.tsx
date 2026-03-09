'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { DietPlanInline } from '@/components/DietPlanDisplay';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface FormField {
    key: string;
    label: string;
    field_type: 'text' | 'number' | 'select';
    options?: string[];
    placeholder?: string;
    required?: boolean;
}

// Use Google Gemini to analyze response and extract form fields
const analyzeWithGemini = async (aiResponse: string): Promise<{
    type: 'questions' | 'plan' | 'unknown';
    message: string;
    form_fields: FormField[];
} | null> => {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aiResponse }),
        });

        if (!response.ok) {
            console.error('Gemini analysis failed');
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Gemini analysis error:', error);
        return null;
    }
};

// Check if response is a diet plan
const isPlanResponse = (text: string): boolean => {
    const lower = text.toLowerCase();
    return (lower.includes('breakfast') && lower.includes('lunch') && lower.includes('dinner')) ||
        lower.includes('meal plan') || lower.includes('diet plan:');
};

// Check if response is asking questions
const isAskingQuestions = (text: string): boolean => {
    return text.includes('?') && (
        text.includes('1.') || text.includes('1)') ||
        text.toLowerCase().includes('please') ||
        text.toLowerCase().includes('need to know')
    );
};

// ... existing imports

export default function ChatPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlChatId = searchParams.get('id');

    const [chatId, setChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "🥗 WELCOME TO NUTRIVEGAN AI!\n\nI create PERSONALIZED diet plans for:\n• Weight Loss / Gain\n• Muscle Building\n• Glowing Skin & Beauty\n• Athletic Performance\n• Medical Conditions\n\nWhat kind of diet plan do you need today?",
        },
    ]);

    // Load history if present
    useEffect(() => {
        if (urlChatId) {
            setChatId(urlChatId);
            setIsLoading(true);
            fetch(`/api/chat/${urlChatId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.chat && data.chat.messages) {
                        const formattedMessages = data.chat.messages.map((m: any) => ({
                            role: m.role,
                            content: m.content
                        }));
                        setMessages(formattedMessages);
                    }
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error('Failed to load chat', err);
                    setIsLoading(false);
                });
        }
    }, [urlChatId]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [planReady, setPlanReady] = useState(false);
    const [collectedData, setCollectedData] = useState<Record<string, string>>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, formFields, planReady, isAnalyzing]);

    const sendToAI = async (messagesToSend: Message[]) => {
        setIsLoading(true);
        setFormFields([]);
        setPlanReady(false);
        let fullResponse = '';

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messagesToSend,
                    chatId: chatId
                }),
            });

            if (!response.ok) throw new Error('Failed to connect to AI');

            // Update chat ID from header if new
            const newChatId = response.headers.get('X-Chat-Id');
            if (newChatId && !chatId) {
                setChatId(newChatId);
                // Optionally update URL without reload
                window.history.replaceState(null, '', `/chat?id=${newChatId}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) throw new Error('No reader');

            setMessages([...messagesToSend, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.content) {
                                fullResponse += data.content;
                                setMessages([...messagesToSend, { role: 'assistant', content: fullResponse }]);
                            }
                        } catch { /* skip parse errors */ }
                    }
                }
            }

            setIsLoading(false);

            // If no response came, show error
            if (!fullResponse.trim()) {
                setMessages([...messagesToSend, { role: 'assistant', content: "⚠️ No response received. Please try again." }]);
                return;
            }

            // Determine response type and get form fields if needed
            if (isPlanResponse(fullResponse)) {
                setPlanReady(true);
            } else if (isAskingQuestions(fullResponse)) {
                // Use Gemini to extract form fields
                setIsAnalyzing(true);
                const analysis = await analyzeWithGemini(fullResponse);
                setIsAnalyzing(false);

                if (analysis && analysis.form_fields && analysis.form_fields.length > 0) {
                    setFormFields(analysis.form_fields);
                    const initialData: Record<string, string> = {};
                    analysis.form_fields.forEach(f => initialData[f.key] = '');
                    setFormData(initialData);
                }
            }

        } catch (error) {
            console.error('Error:', error);
            setMessages([...messagesToSend, { role: 'assistant', content: "⚠️ Connection error. Please try again." }]);
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || isAnalyzing) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setFormFields([]);
        setPlanReady(false);

        await sendToAI([...messages, userMessage]);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const allData = { ...collectedData, ...formData };
        setCollectedData(allData);

        const responseText = formFields
            .filter(f => formData[f.key])
            .map(f => `${f.label}: ${formData[f.key]}`)
            .join('\n');

        const userMessage: Message = { role: 'user', content: responseText };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setFormFields([]);
        setFormData({});

        await sendToAI(newMessages);
    };

    const handleStartPlan = () => {
        const lastAIMessage = messages.filter(m => m.role === 'assistant').pop();
        localStorage.setItem('activePlan', JSON.stringify({
            goal: collectedData.goal || 'Custom Plan',
            dietType: collectedData.diet_preference || collectedData.dietType || 'Mixed',
            startDate: new Date().toISOString(),
            userDetails: collectedData,
            planContent: lastAIMessage?.content || '',
        }));
        router.push('/tracker');
    };

    const handleModifyPlan = () => {
        setPlanReady(false);
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: "What would you like to change?\n• Different meals\n• Adjust portions\n• Add/remove foods\n• Different timing"
        }]);
    };

    return (
        <div className="flex flex-col h-screen bg-retro-bg pb-20">
            <header className="sticky top-0 z-10 bg-retro-primary border-b-4 border-black p-2 shadow-retro">
                <div className="flex justify-between items-center bg-white border-2 border-black p-2">
                    <Link href="/" className="bg-black text-white px-3 py-1 font-bold hover:bg-retro-accent hover:text-black">
                        ← BACK
                    </Link>
                    <div className="text-center">
                        <h1 className="text-lg font-bold uppercase">NutriVegan AI</h1>
                        <div className="text-xs flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-green-500 animate-pulse rounded-full"></span>
                            ONLINE
                        </div>
                    </div>
                    <div className="w-16"></div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono bg-black m-4 border-4 border-gray-600">
                {messages.map((message, index) => {
                    const isAssistant = message.role === 'assistant';
                    const hasPlanContent = isAssistant && isPlanResponse(message.content);

                    return (
                        <div key={index} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <span className="text-xs text-gray-400 mb-1">{message.role === 'user' ? '> YOU' : '> AI'}</span>
                            <div
                                className={`max-w-[90%] p-3 border-2 ${message.role === 'user'
                                    ? 'bg-retro-secondary text-white border-white'
                                    : 'bg-retro-bg text-green-500 border-green-500'}`}
                                style={{ boxShadow: message.role === 'user' ? '3px 3px 0 white' : '3px 3px 0 #00E436' }}
                            >
                                {hasPlanContent ? (
                                    <DietPlanInline content={message.content} />
                                ) : (
                                    <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Form Fields */}
                {formFields.length > 0 && !isLoading && !isAnalyzing && !planReady && (
                    <div className="bg-retro-paper dark:bg-gray-800 border-4 border-retro-accent p-4">
                        <h3 className="text-sm font-bold mb-3 text-black dark:text-white uppercase bg-retro-accent inline-block px-2 py-1">
                            📝 FILL IN YOUR DETAILS
                        </h3>
                        <form onSubmit={handleFormSubmit} className="space-y-3">
                            <div className={`grid gap-3 ${formFields.length <= 3 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                {formFields.map((field) => (
                                    <div key={field.key}>
                                        <label className="block text-xs font-bold mb-1 text-black dark:text-white truncate" title={field.label}>
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        {field.field_type === 'select' ? (
                                            <select
                                                value={formData[field.key] || ''}
                                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                required={field.required}
                                                className="w-full bg-white border-2 border-black p-2 text-black text-sm"
                                            >
                                                <option value="">Select...</option>
                                                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.field_type}
                                                value={formData[field.key] || ''}
                                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                placeholder={field.placeholder}
                                                required={field.required}
                                                className="w-full bg-white border-2 border-black p-2 text-black text-sm"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button type="submit" className="w-full bg-retro-accent text-black border-2 border-black p-3 font-bold hover:bg-black hover:text-retro-accent text-sm">
                                ✓ SUBMIT ANSWERS
                            </button>
                        </form>
                    </div>
                )}

                {/* Plan Ready */}
                {planReady && !isLoading && !isAnalyzing && (
                    <div className="bg-retro-accent border-4 border-black p-4">
                        <p className="text-black font-bold mb-3 text-center text-sm">✅ YOUR PERSONALIZED DIET PLAN IS READY!</p>
                        <div className="flex gap-2">
                            <button onClick={handleStartPlan} className="flex-1 bg-retro-primary text-white border-2 border-black p-3 font-bold text-sm hover:bg-black">
                                ✅ START TRACKING
                            </button>
                            <button onClick={handleModifyPlan} className="flex-1 bg-white text-black border-2 border-black p-3 font-bold text-sm hover:bg-gray-100">
                                ✏️ MODIFY
                            </button>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-retro-bg text-green-500 border-2 border-green-500 p-3 animate-pulse text-sm">
                            &gt; AI IS THINKING...
                        </div>
                    </div>
                )}

                {isAnalyzing && (
                    <div className="flex justify-start">
                        <div className="bg-retro-bg text-yellow-400 border-2 border-yellow-400 p-3 animate-pulse text-sm">
                            &gt; PREPARING INPUT FORM...
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="px-4 pb-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <div className="flex-1 relative">
                        <span className="absolute left-3 top-3 text-gray-500">&gt;</span>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="w-full bg-white border-4 border-black pl-8 pr-4 py-3 font-mono text-sm"
                            disabled={isLoading || isAnalyzing}
                        />
                    </div>
                    <button type="submit" disabled={isLoading || isAnalyzing || !input.trim()} className="bg-retro-primary text-white border-4 border-black px-4 py-3 font-bold text-sm disabled:opacity-50">
                        SEND
                    </button>
                </form>
            </div>
        </div>
    );
}
