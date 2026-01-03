"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}

interface RotatingTextProps {
    texts: string[];
    transition?: any;
    initial?: any;
    animate?: any;
    exit?: any;
    animatePresenceMode?: string;
    animatePresenceInitial?: boolean;
    rotationInterval?: number;
    staggerDuration?: number;
    staggerFrom?: string;
    loop?: boolean;
    auto?: boolean;
    splitBy?: string;
    onNext?: (index: number) => void;
    mainClassName?: string;
    splitLevelClassName?: string;
    elementLevelClassName?: string;
    [key: string]: any;
}

export default function RotatingText(props: RotatingTextProps) {
    const {
        texts,
        transition = { type: 'spring', damping: 25, stiffness: 300 },
        initial = { y: '100%', opacity: 0 },
        animate = { y: 0, opacity: 1 },
        exit = { y: '-120%', opacity: 0 },
        animatePresenceMode = 'wait',
        animatePresenceInitial = false,
        rotationInterval = 2000,
        staggerDuration = 0,
        staggerFrom = 'first',
        loop = true,
        auto = true,
        splitBy = 'words', // Changed from 'characters' to 'words' to prevent double text
        onNext,
        mainClassName,
        splitLevelClassName,
        elementLevelClassName,
        ...rest
    } = props;

    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    const elements = useMemo(() => {
        const currentText = texts[currentTextIndex];

        // Always split by words to prevent character-level duplication
        return currentText.split(' ').map((word, i, arr) => ({
            characters: [word],
            needsSpace: i !== arr.length - 1
        }));
    }, [texts, currentTextIndex]);

    const getStaggerDelay = useCallback(
        (index: number, totalChars: number) => {
            const total = totalChars;
            if (staggerFrom === 'first') return index * staggerDuration;
            if (staggerFrom === 'last') return (total - 1 - index) * staggerDuration;
            if (staggerFrom === 'center') {
                const center = Math.floor(total / 2);
                return Math.abs(center - index) * staggerDuration;
            }
            if (staggerFrom === 'random') {
                const randomIndex = Math.floor(Math.random() * total);
                return Math.abs(randomIndex - index) * staggerDuration;
            }
            return Math.abs(parseInt(staggerFrom) - index) * staggerDuration;
        },
        [staggerFrom, staggerDuration]
    );

    const handleIndexChange = useCallback(
        (newIndex: number) => {
            setCurrentTextIndex(newIndex);
            if (onNext) onNext(newIndex);
        },
        [onNext]
    );

    const next = useCallback(() => {
        const nextIndex = currentTextIndex === texts.length - 1 ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1;
        if (nextIndex !== currentTextIndex) {
            handleIndexChange(nextIndex);
        }
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    useEffect(() => {
        if (!auto) return;
        const intervalId = setInterval(next, rotationInterval);
        return () => clearInterval(intervalId);
    }, [next, rotationInterval, auto]);

    return (
        <motion.span
            className={cn('text-rotate', mainClassName)}
            {...rest}
            layout
            transition={transition}
            aria-label={texts[currentTextIndex]}
        >
            <AnimatePresence mode={animatePresenceMode as any} initial={animatePresenceInitial}>
                <motion.span
                    key={currentTextIndex}
                    className={cn('text-rotate-inner')}
                    layout
                    aria-hidden="true"
                >
                    {elements.map((wordObj, wordIndex, array) => {
                        return (
                            <span key={wordIndex} className={cn('text-rotate-word', splitLevelClassName)}>
                                <motion.span
                                    initial={initial}
                                    animate={animate}
                                    exit={exit}
                                    transition={{
                                        ...transition,
                                        delay: getStaggerDelay(wordIndex, array.length)
                                    }}
                                    className={cn('text-rotate-element', elementLevelClassName)}
                                >
                                    {wordObj.characters[0]}
                                </motion.span>
                                {wordObj.needsSpace && <span className="text-rotate-space"> </span>}
                            </span>
                        );
                    })}
                </motion.span>
            </AnimatePresence>
        </motion.span>
    );
}