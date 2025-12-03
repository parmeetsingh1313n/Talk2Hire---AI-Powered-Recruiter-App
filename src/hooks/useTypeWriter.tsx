import { useEffect, useState } from "react";

export function useTypewriter(text : string, speed = 100, delay = 10) {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsTyping(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    useEffect(() => {
        if (!isTyping) return;

        if (currentIndex >= text.length) {
            setIsComplete(true);
            // Reset for infinite loop
            const resetTimer = setTimeout(() => {
                setDisplayText('');
                setCurrentIndex(0);
                setIsComplete(false);
            }, 2000); // Wait 2 seconds before restarting

            return () => clearTimeout(resetTimer);
        }

        const timer = setTimeout(() => {
            setDisplayText(prev => prev + text[currentIndex]);
            setCurrentIndex(prev => prev + 1);
        }, speed);

        return () => clearTimeout(timer);
    }, [currentIndex, text, speed, isTyping]);

    return { displayText, isComplete };
}