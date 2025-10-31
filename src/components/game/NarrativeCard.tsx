"use client";

import { useState } from "react";
import Image from "next/image";
import type { CardData, Choice } from "@/lib/game-data";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface NarrativeCardProps {
  card: CardData & { image: string, imageHint: string };
  onChoice: (choice: Choice) => void;
}

type AnimationState = "in" | "out-left" | "out-right";

export default function NarrativeCard({ card, onChoice }: NarrativeCardProps) {
  const [animation, setAnimation] = useState<AnimationState>("in");

  const handleSelectChoice = (choice: Choice, direction: "left" | "right") => {
    setAnimation(direction === "left" ? "out-left" : "out-right");
    setTimeout(() => {
      onChoice(choice);
    }, 300);
  };
  
  const getAnimationClass = () => {
    switch (animation) {
      case 'in':
        return 'animate-in fade-in-0 zoom-in-95';
      case 'out-left':
        return 'animate-out fade-out-0 slide-out-to-left-full zoom-out-95';
      case 'out-right':
        return 'animate-out fade-out-0 slide-out-to-right-full zoom-out-95';
    }
  };

  return (
    <div className={cn("w-full cursor-pointer transition-transform duration-300 ease-in-out", getAnimationClass())}>
      <Card className="w-full max-w-sm mx-auto overflow-hidden rounded-lg shadow-lg border-primary/20 bg-card backdrop-blur-sm">
        <div className="relative h-24 w-full">
          <div className="absolute inset-0 bg-gradient-to-b from-card via-card/80 to-transparent z-10" />
        </div>
        <CardContent className="p-6 text-center -mt-20 relative z-20">
          <div className="relative h-28 w-28 mx-auto rounded-full overflow-hidden border-2 border-primary/50 mb-4">
             <Image
              src={card.image}
              alt={card.character}
              fill
              sizes="112px"
              className="object-cover"
              data-ai-hint={card.imageHint}
              priority
            />
          </div>
          <h2 className="font-headline text-xl font-bold text-primary mb-2">{card.character}</h2>
          <p className="text-lg font-body text-foreground/90 mb-6 min-h-[120px]">{card.text}</p>
          <div className="flex justify-between gap-4">
            <div className="w-1/2 text-left font-body text-foreground/70" onClick={() => handleSelectChoice(card.choices[0], 'left')}>
              {card.choices[0].text}
            </div>
            <div className="w-1/2 text-right font-body text-foreground/70" onClick={() => handleSelectChoice(card.choices[1], 'right')}>
              {card.choices[1].text}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
