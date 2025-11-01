
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import SettingsDialog from "./SettingsDialog";
import { cn } from '@/lib/utils';

interface IntroScreenProps {
  onFinish: () => void;
}

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
    
    const handleClick = () => {
        setIsExiting(true);
        setTimeout(onFinish, 1500); // Match this duration with the longest transition
    };

    return (
        <div
        className={cn(
            "flex h-screen w-screen cursor-pointer flex-col items-center justify-center bg-background transition-opacity duration-1000",
            isExiting ? "opacity-0" : "opacity-100 animate-in fade-in-0"
        )}
        onClick={!isExiting ? handleClick : undefined}
        >
            <ChariotWheel isVisible={!isExiting} />
            <div className={cn(
                "z-10 flex flex-col items-center gap-2 text-center transition-all duration-1000 ease-in-out",
                isExiting ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
            )}>
                <h1 className={cn(
                    "font-headline text-primary tracking-wider transition-all duration-1000 ease-in-out text-7xl"
                )}>
                    DRIFT
                </h1>
            </div>
            
            <div className={cn(
                 "absolute bottom-10 z-10 font-body text-sm text-muted-foreground transition-opacity duration-500",
                 isExiting ? "opacity-0" : "animate-pulse opacity-100"
            )}>
                Click anywhere to begin
            </div>
        </div>
    );
}
