
"use client";

import { useState, useEffect, useContext, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { SoundContext } from '@/contexts/SoundContext';

interface IntroScreenProps {
  onFinish: () => void;
}

const introPhrases = [
    "The river flows.",
    "The sand shifts.",
    "A throne sits empty.",
    "An endless present awaits.",
    "Your endless present awaits."
];

const ChariotWheel = ({ isVisible }: { isVisible: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    className={cn(
        "absolute inset-0 m-auto h-[90vmin] w-[90vmin] text-primary transition-opacity duration-1000",
        isVisible ? "animate-spin-slow opacity-10" : "opacity-0"
    )}
    fill="none"
    stroke="currentColor"
    strokeWidth="0.5"
  >
    <circle cx="50" cy="50" r="48" />
    <circle cx="50" cy="50" r="8" />
    {[...Array(12)].map((_, i) => (
      <line
        key={i}
        x1="50"
        y1="50"
        x2={50 + 40 * Math.cos((i * Math.PI) / 6)}
        y2={50 + 40 * Math.sin((i * Math.PI) / 6)}
      />
    ))}
  </svg>
);


export default function IntroScreen({ onFinish }: IntroScreenProps) {
    const [isExiting, setIsExiting] = useState(false);
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const { bgmVolume } = useContext(SoundContext);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio('/assets/sounds/intro.mp3');
            audioRef.current.loop = true;
        }

        if (bgmVolume > 0) {
            audioRef.current.volume = bgmVolume * 0.35; // Play intro at 35% of master volume
            audioRef.current.play().catch(e => {});
        }

        return () => {
            audioRef.current?.pause();
        }
    }, [bgmVolume]);

    useEffect(() => {
        if (phraseIndex >= introPhrases.length) {
            handleClick();
            return;
        }

        const fadeInTimer = setTimeout(() => {
            setIsFading(false);
        }, 500); 

        const fadeOutTimer = setTimeout(() => {
            setIsFading(true);
        }, 2500);

        const nextPhraseTimer = setTimeout(() => {
            setPhraseIndex(prev => prev + 1);
        }, 3000);

        return () => {
            clearTimeout(fadeInTimer);
            clearTimeout(fadeOutTimer);
            clearTimeout(nextPhraseTimer);
        }
    }, [phraseIndex]);
    
    const handleClick = () => {
        if (isExiting) return;
        
        setIsExiting(true);
        if (audioRef.current) {
            // Fade out audio
            let vol = audioRef.current.volume;
            const fadeOutInterval = setInterval(() => {
                vol -= 0.05;
                if (vol > 0) {
                    audioRef.current!.volume = vol;
                } else {
                    audioRef.current!.pause();
                    clearInterval(fadeOutInterval);
                }
            }, 50);
        }
        setTimeout(onFinish, 1500); // Match this duration with the longest transition
    };

    return (
        <div
        className={cn(
            "flex h-screen w-screen cursor-pointer flex-col items-center justify-center bg-background transition-opacity duration-1000",
            isExiting ? "opacity-0" : "opacity-100 animate-in fade-in-0"
        )}
        onClick={handleClick}
        >
            <ChariotWheel isVisible={!isExiting} />

            <div className={cn(
                "z-10 flex flex-col items-center gap-2 text-center transition-all duration-1000 ease-in-out",
                isExiting ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
            )}>
                 {phraseIndex < introPhrases.length -1 ? (
                    <p className={cn(
                        "font-headline text-3xl text-foreground/80 transition-opacity duration-500",
                        isFading ? 'opacity-0' : 'opacity-100'
                    )}>
                        {introPhrases[phraseIndex]}
                    </p>
                ) : (
                     <h1 className={cn(
                        "font-headline text-primary tracking-wider transition-all duration-1000 ease-in-out text-7xl"
                    )}>
                        DRIFT
                    </h1>
                )}
            </div>
            
            <div className={cn(
                 "absolute bottom-10 z-10 font-body text-sm text-muted-foreground transition-opacity duration-500",
                 isExiting || phraseIndex < introPhrases.length ? "opacity-0" : "animate-pulse opacity-100"
            )}>
                Click anywhere to begin
            </div>
        </div>
    );
}
