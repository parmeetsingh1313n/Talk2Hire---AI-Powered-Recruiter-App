// src/app/interview/[interview_id]/room/_components/avatar/AvatarLipsyncHook.ts
import { useCallback, useEffect, useRef, useState } from 'react';

type VoiceSettings = {
    rate?: number;
    pitch?: number;
    volume?: number;
};

type VisemeDuration = {
    viseme: string;
    duration: number;
};

export const useAvatarLipsync = () => {
    const lipsyncIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isStoppingRef = useRef(false);

    const [currentViseme, setCurrentViseme] = useState('sil');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [audioReady, setAudioReady] = useState(false);

    useEffect(() => {
        const init = () => {
            if (typeof window !== 'undefined' && !window.speechSynthesis) {
                console.error("❌ [Lipsync] Speech synthesis not available");
                setAudioReady(false);
                return;
            }

            const loadVoices = () => {
                const voices = window.speechSynthesis.getVoices();
                if (voices.length > 0) {
                    setAudioReady(true);
                }
            };

            if (window.speechSynthesis.getVoices().length === 0) {
                window.speechSynthesis.onvoiceschanged = () => {
                    loadVoices();
                    window.speechSynthesis.onvoiceschanged = null;
                };
                setTimeout(loadVoices, 1000);
            } else {
                loadVoices();
            }
        };

        init();
        return () => stopLipsyncProcessing();
    }, []);

    // Explicitly define the map with an index signature
    const VISEME_MAP: { [key: string]: string } = {
        'a': 'aa', 'e': 'E', 'i': 'I', 'o': 'O', 'u': 'U',
        'b': 'PP', 'p': 'PP', 'm': 'PP',
        'f': 'FF', 'v': 'FF',
        'th': 'TH',
        't': 'DD', 'd': 'DD', 'n': 'DD', 'l': 'DD',
        'k': 'kk', 'g': 'kk', 'c': 'kk', 'q': 'kk',
        's': 'SS', 'z': 'SS', 'x': 'SS',
        'ch': 'CH', 'sh': 'CH', 'j': 'CH',
        'ng': 'nn',
        'r': 'RR',
        'w': 'U', 'h': 'aa'
    };

    const VISEME_DURATIONS: { [key: string]: number } = {
        'aa': 150, 'E': 150, 'I': 150, 'O': 180, 'U': 150,
        'PP': 60, 'FF': 70, 'TH': 80, 'DD': 70, 'kk': 70,
        'CH': 100, 'SS': 100, 'nn': 80, 'RR': 100,
        'sil': 50
    };

    const generateLipsyncPattern = (text: string): VisemeDuration[] => {
        if (!text) return [];

        const pattern: VisemeDuration[] = [];
        const words = text.toLowerCase().match(/[\w']+|[.,!?;]/g) || [];

        words.forEach((token) => {
            if (/[.,!?;]/.test(token)) {
                pattern.push({ viseme: 'sil', duration: 300 });
                return;
            }

            for (let i = 0; i < token.length; i++) {
                const char = token[i];
                const nextChar = token[i + 1];
                let viseme = null;

                if (nextChar) {
                    const bigram = char + nextChar;
                    if (['th', 'ch', 'sh', 'ph', 'ng'].includes(bigram)) {
                        viseme = VISEME_MAP[bigram] || VISEME_MAP[char];
                        i++;
                    }
                }

                if (!viseme) {
                    viseme = VISEME_MAP[char] || 'sil';
                }

                if (viseme !== 'sil') {
                    pattern.push({
                        viseme,
                        duration: VISEME_DURATIONS[viseme] || 100
                    });
                }
            }
            pattern.push({ viseme: 'sil', duration: 40 });
        });

        return pattern;
    };

    const stopLipsyncProcessing = useCallback(() => {
        isStoppingRef.current = true;

        if (lipsyncIntervalRef.current) {
            clearTimeout(lipsyncIntervalRef.current);
            lipsyncIntervalRef.current = null;
        }
        if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
            speechTimeoutRef.current = null;
        }

        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        utteranceRef.current = null;
        setIsProcessing(false);
        setIsSpeaking(false);
        setCurrentViseme('sil');

        setTimeout(() => { isStoppingRef.current = false; }, 100);
    }, []);

    // FIX: Explicitly type the callback parameters
    const playTextWithLipsync = useCallback(async (
        text: string | null | undefined,
        voiceSettings: VoiceSettings = {},
        onComplete?: () => void
    ) => {
        if (!audioReady || !text?.trim()) {
            if (onComplete) onComplete();
            return;
        }

        return new Promise<void>((resolve) => {
            stopLipsyncProcessing();

            const pattern = generateLipsyncPattern(text);
            const utterance = new SpeechSynthesisUtterance(text);
            utteranceRef.current = utterance;

            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v =>
                v.name.toLowerCase().includes('female') ||
                v.name.toLowerCase().includes('zira')
            ) || voices[0];

            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.rate = voiceSettings.rate || 1.0;
            utterance.pitch = voiceSettings.pitch || 1.1;
            utterance.volume = voiceSettings.volume || 1.0;

            let hasCompleted = false;

            const playVisemeSequence = (index: number) => {
                if (hasCompleted || isStoppingRef.current) return;

                if (index >= pattern.length) {
                    setCurrentViseme('sil');
                    return;
                }

                const current = pattern[index];
                setCurrentViseme(current.viseme);

                const stepDuration = current.duration / utterance.rate;

                lipsyncIntervalRef.current = setTimeout(() => {
                    playVisemeSequence(index + 1);
                }, stepDuration);
            };

            utterance.onstart = () => {
                if (hasCompleted) return;
                console.log("▶️ [Lipsync] Started");
                setIsProcessing(true);
                setIsSpeaking(true);
                playVisemeSequence(0);
            };

            utterance.onend = () => {
                if (hasCompleted) return;
                hasCompleted = true;
                console.log("✅ [Lipsync] Ended");
                stopLipsyncProcessing();
                resolve();
                if (onComplete) onComplete();
            };

            utterance.onerror = (e) => {
                if (hasCompleted) return;
                if (e.error === 'interrupted' || e.error === 'canceled') {
                    resolve();
                    return;
                }
                console.warn("⚠️ [Lipsync] Error", e);
                hasCompleted = true;
                stopLipsyncProcessing();
                resolve();
                if (onComplete) onComplete();
            };

            window.speechSynthesis.speak(utterance);
        });
    }, [audioReady, stopLipsyncProcessing]);

    return {
        currentViseme,
        isProcessing,
        isSpeaking,
        audioReady,
        playTextWithLipsync,
        stopLipsyncProcessing,
        cleanup: stopLipsyncProcessing
    };
};