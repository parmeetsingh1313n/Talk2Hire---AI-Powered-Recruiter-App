import { getAssemblyToken } from './getAssemblyToken';

export async function createTranscriber(
    setTranscript: (text: string | ((prev: string) => string)) => void,
    setIsTranscribing: (transcribing: boolean) => void
) {
    try {
        const token = await getAssemblyToken();
        console.log('Got AssemblyAI token');

        // Dynamically import AssemblyAI
        const { RealtimeTranscriber } = await import('assemblyai');

        const transcriber = new RealtimeTranscriber({
            token: token,
            sampleRate: 16000,
        });

        transcriber.on('open', ({ sessionId }) => {
            console.log(`Transcriber opened with session ID: ${sessionId}`);
            setIsTranscribing(true);
        });

        transcriber.on('error', (error: any) => {
            console.error('Transcriber error:', error);
            setIsTranscribing(false);
        });

        transcriber.on('close', (code: number, reason: string) => {
            console.log(`Transcriber closed with code ${code} and reason: ${reason}`);
            setIsTranscribing(false);
        });

        transcriber.on('transcript', (transcript: any) => {
            if (!transcript.text) return;

            console.log('Transcript:', transcript);

            if (transcript.message_type === 'FinalTranscript') {
                setTranscript((prev: string) => prev + transcript.text + ' ');
            }
        });

        return transcriber;
    } catch (error) {
        console.error('Error creating transcriber:', error);
        throw error;
    }
}