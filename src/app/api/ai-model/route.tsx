import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { QUESTION_PROMPT } from '../../../../services/Constants';

export async function POST(req: Request) {
    try {
        const { jobPosition, jobDescription, duration, type } = await req.json();

        const FINAL_PROMPT = QUESTION_PROMPT.replace('{{jobTitle}}', jobPosition)
            .replace('{{jobDescription}}', jobDescription)
            .replace('{{duration}}', duration)
            .replace('{{type}}', type);

        console.log('Final Prompt:', FINAL_PROMPT);

        // Initialize Groq client
        const groqClient = new OpenAI({
            apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
            baseURL: 'https://api.groq.com/openai/v1'
        });

        const completion = await groqClient.chat.completions.create({
            model: 'openai/gpt-oss-120b',
            messages: [
                {
                    role: 'user',
                    content: FINAL_PROMPT,
                },
            ],
        });

        const rawContent = completion.choices[0].message.content;
        console.log('Raw AI Response:', rawContent);

        // Clean the response by removing markdown code blocks and extra text
        let cleanedContent = rawContent ?? '';

        // Remove ```json and ``` markers
        cleanedContent = cleanedContent.replace(/```json\n?/gi, '').replace(/```\n?/g, '');

        // Find the JSON array/object part (between [ and ] or { and })
        const jsonMatch = cleanedContent.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);

        if (jsonMatch) {
            cleanedContent = jsonMatch[1].trim();
        }

        console.log('Cleaned Content:', cleanedContent);

        // Try to parse as JSON
        let parsedQuestions;
        try {
            parsedQuestions = JSON.parse(cleanedContent);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            return NextResponse.json({
                error: 'Failed to parse AI response as JSON',
                rawContent: rawContent,
                cleanedContent: cleanedContent
            }, { status: 500 });
        }

        // Return the parsed questions
        return NextResponse.json({
            content: cleanedContent,
            questions: parsedQuestions,
            success: true
        });

    } catch (error) {
        console.log('Error generating interview questions:', error);
        return NextResponse.json(
            { error: 'Failed to generate interview questions' },
            { status: 500 }
        );
    }
}