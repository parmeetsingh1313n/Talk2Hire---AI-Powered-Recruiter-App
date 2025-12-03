class AudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input.length > 0) {
            const inputChannel = input[0];
            const output = new Int16Array(inputChannel.length);
            for (let i = 0; i < inputChannel.length; i++) {
                output[i] = Math.max(-1, Math.min(1, inputChannel[i])) * 0x7FFF;
            }
            this.port.postMessage({ audio_data: output.buffer }, [output.buffer]);
        }
        return true;
    }
}

registerProcessor('audio-processor', AudioProcessor);