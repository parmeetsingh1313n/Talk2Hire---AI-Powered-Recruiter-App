import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const apiKey = process.env.ASSEMBLYAI_API_KEY;

        if (!apiKey) {
            console.error('ASSEMBLYAI_API_KEY is not set');
            return NextResponse.json(
                { error: 'AssemblyAI API key not configured' },
                { status: 500 }
            );
        }

        // Direct API call to AssemblyAI
        const response = await fetch('https://api.assemblyai.com/v2/realtime/token', {
            method: 'POST',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                expires_in: 60
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('AssemblyAI API error:', response.status, errorText);
            throw new Error(`AssemblyAI API responded with ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (!data.token) {
            throw new Error('No token received from AssemblyAI');
        }

        console.log('Successfully generated AssemblyAI token');
        return NextResponse.json({ token: data.token });

    } catch (error: any) {
        console.error('Error in assemblyToken route:', error);
        return NextResponse.json(
            {
                error: 'Failed to create token',
                details: error.message
            },
            { status: 500 }
        );
    }
}