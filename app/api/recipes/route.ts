import { NextRequest, NextResponse } from 'next/server';

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
// Using Meta Llama 3.2 90B Vision (Hosted on NVIDIA NIM)
const MODEL_ID = 'meta/llama-3.2-90b-vision-instruct';
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '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';

export async function POST(request: NextRequest) {
    try {
        const { query, dietContext, imageBase64 } = await request.json();

        // Validate input - either query or image required
        if ((!query || query.trim().length === 0) && !imageBase64) {
            return NextResponse.json({ error: 'Recipe query or image is required' }, { status: 400 });
        }

        const systemPrompt = `You are a professional nutritionist and chef. Generate healthy recipes that are:
- Easy to prepare at home
- Nutritious and balanced
- Include exact measurements
${dietContext ? `- Suitable for: ${dietContext}` : ''}

Format your response as JSON with this structure:
{
    "title": "Recipe Name",
    "prepTime": "15 mins",
    "cookTime": "30 mins",
    "servings": 2,
    "calories": 350,
    "difficulty": "Easy",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": ["Step 1", "Step 2"],
    "nutritionTips": "Brief nutrition benefits",
    "tags": ["healthy", "low-carb"]
}

Only respond with valid JSON, no markdown or extra text.`;

        // Build message payload
        const messages: Record<string, unknown>[] = [
            { role: 'system', content: systemPrompt }
        ];

        if (imageBase64) {
            // Vision Request: Structure content as array with text and image
            const textPrompt = query
                ? `Look at this food image and suggest a healthy recipe using these ingredients. Additional context: ${query}`
                : `Look at this food image and suggest a healthy recipe using these ingredients.`;

            messages.push({
                role: 'user',
                content: [
                    { type: 'text', text: textPrompt },
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:image/jpeg;base64,${imageBase64}`
                        }
                    }
                ]
            });
        } else {
            // Text-only request
            messages.push({
                role: 'user',
                content: `Generate a healthy recipe for: ${query}`
            });
        }

        const response = await fetch(NVIDIA_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NVIDIA_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL_ID,
                messages: messages,
                max_tokens: 1024,
                temperature: 0.2, // Slightly higher for creativity in recipes
                top_p: 1.00,
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('NVIDIA API error:', errorText);

            // Fallback handling or specific error messages could go here
            return NextResponse.json({ error: 'Failed to generate recipe' }, { status: 500 });
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            return NextResponse.json({ error: 'No recipe generated' }, { status: 500 });
        }

        // Parse the JSON response
        try {
            // Clean up the response - remove markdown code blocks if present
            let cleanedContent = content.trim();
            // Handle markdown code blocks
            if (cleanedContent.includes('```')) {
                cleanedContent = cleanedContent.replace(/```json\n?|```/g, '').trim();
            }

            const recipe = JSON.parse(cleanedContent);
            return NextResponse.json({ recipe, success: true });
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            // Return raw content if JSON parsing fails
            return NextResponse.json({
                recipe: {
                    title: query || 'Recipe from Image',
                    rawContent: content,
                    isRaw: true
                },
                success: true
            });
        }

    } catch (error) {
        console.error('Recipe generation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
