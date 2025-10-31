"use client";

import { useState } from "react";
import Image from "next/image";
import type { CardData, Choice } from "@/lib/game-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      // The parent component will re-render this with a new key, resetting the state.
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
    <div className={cn("w-full transition-transform duration-300 ease-in-out", getAnimationClass())}>
      <Card className="w-full max-w-md mx-auto overflow-hidden rounded-2xl shadow-lg border-2 border-primary/20 bg-card/80 backdrop-blur-sm">
        <div className="relative h-64 w-full">
           <Image
            src={card.image}
            alt={card.character}
            fill
            sizes="100vw"
            className="object-cover"
            data-ai-hint={card.imageHint}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h2 className="font-headline text-3xl font-bold text-glow">{card.character}</h2>
          </div>
        </div>
        <CardContent className="p-6">
          <p className="text-lg leading-relaxed text-foreground/90 mb-6 min-h-[100px]">{card.text}</p>
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full h-auto min-h-[50px] justify-start p-4 text-left whitespace-normal border-accent/50 hover:bg-accent/20 hover:text-accent-foreground"
              onClick={() => handleSelectChoice(card.choices[0], 'left')}
            >
              {card.choices[0].text}
            </Button>
            <Button
              variant="outline"
              className="w-full h-auto min-h-[50px] justify-start p-4 text-left whitespace-normal border-accent/50 hover:bg-accent/20 hover:text-accent-foreground"
              onClick={() => handleSelectChoice(card.choices[1], 'right')}
            >
              {card.choices[1].text}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
