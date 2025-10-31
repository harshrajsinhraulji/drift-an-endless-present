"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import type { CardData, Choice } from "@/lib/game-data";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface NarrativeCardProps {
  card: CardData & { image: string, imageHint: string };
  onChoice: (choice: Choice) => void;
}

export default function NarrativeCard({ card, onChoice }: NarrativeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragX, setDragX] = useState(0);

  const dragThreshold = 80;

  const handleChoiceMade = useCallback((choice: Choice) => {
    onChoice(choice);
    // After a short delay to allow the card to animate out, reset the state.
    setTimeout(() => {
        setDragX(0);
        if (cardRef.current) {
          cardRef.current.style.transition = 'none'; // Prevent transition on reset
        }
    }, 300);
  }, [onChoice]);

  const handleDragStart = (clientX: number) => {
    if (cardRef.current) {
      setIsDragging(true);
      setStartX(clientX);
      cardRef.current.style.transition = 'none';
    }
  };
  
  const handleDragMove = (clientX: number) => {
    if (!isDragging || !cardRef.current) return;
    const dx = clientX - startX;
    setDragX(dx);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);

    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    }

    if (Math.abs(dragX) > dragThreshold) {
      const direction = dragX > 0 ? "right" : "left";
      const choiceIndex = direction === "right" ? 1 : 0;
      handleChoiceMade(card.choices[choiceIndex]);
    } else {
        // If not dragged far enough, snap back to center
        setDragX(0);
    }
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (isDragging) return; // Don't allow key press during a drag

    let choiceIndex: number | null = null;
    if (event.key === 'ArrowLeft') {
      choiceIndex = 0;
      setDragX(-(dragThreshold + 20)); // Move past threshold to trigger animation
    } else if (event.key === 'ArrowRight') {
      choiceIndex = 1;
      setDragX(dragThreshold + 20); // Move past threshold to trigger animation
    }

    if (choiceIndex !== null && cardRef.current) {
        cardRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        handleChoiceMade(card.choices[choiceIndex]);
    }
  }, [isDragging, handleChoiceMade, card.choices]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Reset card component state when card changes
  useEffect(() => {
    setDragX(0);
    if(cardRef.current) {
      cardRef.current.style.transform = `translateX(0px) rotate(0deg) scale(1)`;
      cardRef.current.style.opacity = '1';
    }
  }, [card]);

  const rotation = dragX / 20;
  const cardStyle = {
    transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
  };

  const leftChoiceOpacity = dragX < 0 ? Math.min(Math.abs(dragX) / dragThreshold, 1) : 0;
  const rightChoiceOpacity = dragX > 0 ? Math.min(dragX / dragThreshold, 1) : 0;
  const cardOpacity = 1 - Math.abs(dragX) / (dragThreshold * 2);

  return (
    <div 
        className="w-full h-[470px] relative cursor-grab active:cursor-grabbing group"
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
    >
        {/* Choice overlays */}
       <div className="absolute top-1/2 left-4 transform -translate-y-1/2 p-4 border-2 border-primary/80 rounded-md bg-card/80 backdrop-blur-sm shadow-lg" style={{ opacity: leftChoiceOpacity, transition: 'opacity 0.2s' }}>
          <p className="font-body text-primary text-lg">{card.choices[0].text}</p>
      </div>
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 p-4 border-2 border-primary/80 rounded-md bg-card/80 backdrop-blur-sm shadow-lg" style={{ opacity: rightChoiceOpacity, transition: 'opacity 0.2s' }}>
          <p className="font-body text-primary text-lg">{card.choices[1].text}</p>
      </div>
      
      <div 
        ref={cardRef} 
        style={cardStyle} 
        className={cn(
          "w-full absolute animate-in fade-in-0 zoom-in-95 duration-300 transition-transform group-hover:scale-105",
          isDragging ? "" : "transition-all",
        )}
      >
        <Card className="w-full max-w-sm mx-auto overflow-hidden rounded-lg shadow-lg border-primary/20 bg-card backdrop-blur-sm" style={{opacity: cardOpacity}}>
          <div className="relative h-24 w-full">
            <div className="absolute inset-0 bg-gradient-to-b from-card via-card/80 to-transparent z-10" />
          </div>
          <CardContent className="p-6 text-center -mt-20 relative z-20">
            <div className="relative h-28 w-28 mx-auto rounded-full overflow-hidden border-2 border-primary/50 mb-4 shadow-md">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
