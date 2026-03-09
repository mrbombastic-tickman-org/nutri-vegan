import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

interface FormField {
    key: string;
    label: string;
    field_type: 'text' | 'number' | 'select';
    options?: string[];
    placeholder?: string;
    required?: boolean;
}

interface AnalysisResult {
    type: 'questions' | 'plan' | 'unknown';
    message: string;
    form_fields?: FormField[];
}

const client = new OpenAI({
    baseURL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
    apiKey: process.env.NVIDIA_API_KEY || '',
});

export async function POST(req: NextRequest) {
    try {
        const { aiResponse } = await req.json();

        if (!aiResponse || typeof aiResponse !== 'string') {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        // Use Mistral model for fast analysis
        const response = await client.chat.completions.create({
            model: 'mistralai/mistral-7b-instruct-v0.3',
            messages: [
                {
                    role: 'system',
                    content: `Analyze NutriVegan AI responses and extract form fields.

OUTPUT FORMAT (JSON only, no other text):
{
  "type": "questions" or "plan",
  "message": "clean message without JSON",
  "form_fields": [
    {"key": "unique_key", "label": "Label", "field_type": "text|number|select", "options": ["for select only"], "placeholder": "hint", "required": true}
  ]
}

RULES:
- type="questions" if AI is asking for user info
- type="plan" if AI provides a diet plan (has breakfast/lunch/dinner)
- For each question, create a form field:
  - "number" for: age, weight, height, calories
  - "select" for: gender (Male/Female/Other), diet preference (Vegetarian/Non-Vegetarian/Vegan), activity level (Sedentary/Light/Moderate/Active), skin type (Oily/Dry/Combination/Normal), yes/no questions
  - "text" for: symptoms, allergies, medications, conditions
- Return ONLY valid JSON`
                },
                {
                    role: 'user',
                    content: `Analyze this response:\n\n${aiResponse}`
                }
            ],
            temperature: 0.1,
            max_tokens: 1024,
        });

        const generatedText = response.choices[0]?.message?.content || '';

        // Robust JSON extraction
        let result: AnalysisResult;
        try {
            let jsonString = generatedText.trim();
            // Remove markdown code blocks if present
            if (jsonString.includes('```')) {
                jsonString = jsonString.replace(/```json\n?|```/g, '').trim();
            }

            // Find the first '{' and last '}' to extract the JSON object
            const firstBrace = jsonString.indexOf('{');
            const lastBrace = jsonString.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                jsonString = jsonString.substring(firstBrace, lastBrace + 1);
                result = JSON.parse(jsonString);
            } else {
                throw new Error('No JSON object found in response');
            }
        } catch (e) {
            console.error('JSON Parse Error:', e);
            // Fallback: return as plain message
            result = {
                type: 'unknown',
                message: generatedText, // Return full text if parsing fails
                form_fields: []
            };
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('Analysis API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
