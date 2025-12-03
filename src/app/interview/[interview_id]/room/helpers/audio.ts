export function mergeBuffers(lhs: Int16Array, rhs: Int16Array): Int16Array {
    const mergedBuffer = new Int16Array(lhs.length + rhs.length);
    mergedBuffer.set(lhs, 0);
    mergedBuffer.set(rhs, lhs.length);
    return mergedBuffer;
}

export function createMicrophone(stream: MediaStream) {
    let audioWorkletNode: AudioWorkletNode | null = null;
    let audioContext: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let audioBufferQueue: Int16Array = new Int16Array(0);

    return {
        async startRecording(onAudioCallback: (buffer: Uint8Array) => void) {
            try {
                audioContext = new AudioContext({
                    sampleRate: 16000,
                    latencyHint: 'balanced',
                });

                source = audioContext.createMediaStreamSource(stream);

                // Load audio processor
                await audioContext.audioWorklet.addModule('/audio-processor.js');
                audioWorkletNode = new AudioWorkletNode(audioContext, 'audio-processor');

                source.connect(audioWorkletNode);
                audioWorkletNode.connect(audioContext.destination);

                audioWorkletNode.port.onmessage = (event) => {
                    try {
                        const audioData = event.data.audio_data;
                        const currentBuffer = new Int16Array(audioData);

                        audioBufferQueue = mergeBuffers(audioBufferQueue, currentBuffer);
                        const bufferDuration = (audioBufferQueue.length / audioContext!.sampleRate) * 1000;

                        // Wait until we have 100ms of audio data
                        if (bufferDuration >= 100) {
                            const totalSamples = Math.floor(audioContext!.sampleRate * 0.1);
                            const finalBuffer = new Uint8Array(
                                audioBufferQueue.subarray(0, totalSamples).buffer
                            );
                            audioBufferQueue = audioBufferQueue.subarray(totalSamples);

                            if (onAudioCallback) onAudioCallback(finalBuffer);
                        }
                    } catch (error) {
                        console.error('Error processing audio:', error);
                    }
                };
            } catch (error) {
                console.error('Error starting audio recording:', error);
                throw error;
            }
        },

        stopRecording() {
            stream?.getTracks().forEach((track) => track.stop());
            audioContext?.close();
            audioWorkletNode?.disconnect();
            source?.disconnect();
            audioBufferQueue = new Int16Array(0);
        },
    };
}