"use client";

import { Button } from "@/components/ui/button";

interface TitleScreenProps {
  onStart: () => void;
  onContinue: () => void;
  hasSave: boolean;
}

export default function TitleScreen({ onStart, onContinue, hasSave }: TitleScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-sm animate-in fade-in-0 duration-500">
      <div className="flex flex-col items-center gap-2">
        <h1 className="font-headline text-5xl text-primary tracking-wider">LAPSE</h1>
        <p className="font-body text-lg text-foreground/80">A Forgotten Future</p>
      </div>
      <div className="flex flex-col gap-4 mt-16 w-full">
        {hasSave && (
          <Button onClick={onContinue} className="w-full font-headline text-xl" variant="outline">
            Continue
          </Button>
        )}
        <Button onClick={onStart} className="w-full font-headline text-xl" variant="outline">
          {hasSave ? "New Game" : "Begin"}
        </Button>
      </div>
    </div>
  );
}
