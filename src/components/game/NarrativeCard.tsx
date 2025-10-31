
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import type { CardData, Choice, ResourceId } from "@/lib/game-data";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Leaf, Users, Shield, CircleDollarSign, ChevronLeft, ChevronRight } from "lucide-react";

interface NarrativeCardProps {
  card: CardData & { image: string, imageHint: string };
  onChoice: (choice: Choice) => void;
  showPrescience: boolean;
  isFirstTurn?: boolean;
}

const resourceIcons: Record<ResourceId, React.ElementType> = {
  environment: Leaf,
  people: Users,
  army: Shield,
  money: CircleDollarSign,
};

const PrescienceDisplay = ({ effects }: { effects: Partial<Record<ResourceId, number>> }) => {
  return (
    <div className="flex justify-center items-center gap-2 mt-1">
      {(Object.keys(effects) as ResourceId[]).map(id => {
        const effect = effects[id];
        if (!effect) return null;
        const Icon = resourceIcons[id];
        const magnitude = Math.min(Math.ceil(Math.abs(effect) / 10), 3);
        const change = Math.sign(effect);

        return (
          <div key={id} className="flex items-center gap-1">
            <Icon className={cn("w-3 h-3", change > 0 ? "text-green-400" : "text-red-400")} />
            <div className="flex items-center gap-0.5">
              {Array.from({ length: magnitude }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 h-1 rounded-full",
                    change > 0 ? "bg-green-400" : "bg-red-400"
                  )}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};


export default function NarrativeCard({ card, onChoice, showPrescience, isFirstTurn = false }: NarrativeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const dragThreshold = 80;

  const handleChoiceMade = useCallback((choice: Choice) => {
    setIsAnimatingOut(true);
    // The onChoice will be called after the animation finishes in the handleDragEnd or handleKeyDown
    setTimeout(() => {
        onChoice(choice);
    }, 300);
  }, [onChoice]);

  const handleDragStart = (clientX: number) => {
    if (isAnimatingOut) return;
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
    if (!isDragging || isAnimatingOut) return;
    
    setIsDragging(false);

    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    }

    if (Math.abs(dragX) > dragThreshold) {
      const direction = dragX > 0 ? "right" : "left";
      const choiceIndex = direction === "right" ? 1 : 0;
       // Apply final animation state
      setDragX(direction === 'left' ? -500 : 500);
      handleChoiceMade(card.choices[choiceIndex]);
    } else {
        // If not dragged far enough, snap back to center
        setDragX(0);
    }
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (isDragging || isAnimatingOut) return; // Don't allow key press during a drag

    let choiceIndex: number | null = null;
    if (event.key === 'ArrowLeft') {
      choiceIndex = 0;
      setDragX(-(dragThreshold + 40));
    } else if (event.key === 'ArrowRight') {
      choiceIndex = 1;
      setDragX(dragThreshold + 40);
    }

    if (choiceIndex !== null && cardRef.current) {
        cardRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        handleChoiceMade(card.choices[choiceIndex]);
    }
  }, [isDragging, isAnimatingOut, handleChoiceMade, card.choices]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Reset card component state when card changes
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'none'; // No transition on reset
      setDragX(0);
      setIsAnimatingOut(false);
      cardRef.current.style.transform = `translateX(0px) rotate(0deg) scale(1)`;
      cardRef.current.style.opacity = '1';
    }
  }, [card.id]);

  const rotation = dragX / 20;
  const cardStyle = {
    transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
  };

  const choiceOpacity = Math.min(Math.abs(dragX) / dragThreshold, 1);
  const cardOpacity = isAnimatingOut ? 0 : 1;

  const leftChoiceOpacity = Math.max(0, Math.min(1, -dragX / (dragThreshold * 0.75)));
  const rightChoiceOpacity = Math.max(0, Math.min(1, dragX / (dragThreshold * 0.75)));


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
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-24 flex items-center justify-between px-4 pointer-events-none z-30">
        <div style={{ opacity: leftChoiceOpacity }} className="transition-opacity text-left max-w-[45%]">
          <p className="font-headline text-primary text-xl text-center drop-shadow-lg">{card.choices[0].text}</p>
          {showPrescience && <PrescienceDisplay effects={card.choices[0].effects} />}
        </div>
        <div style={{ opacity: rightChoiceOpacity }} className="transition-opacity text-right max-w-[45%]">
          <p className="font-headline text-primary text-xl text-center drop-shadow-lg">{card.choices[1].text}</p>
          {showPrescience && <PrescienceDisplay effects={card.choices[1].effects} />}
        </div>
      </div>
      
      {isFirstTurn && (
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-0">
          <ChevronLeft className="w-10 h-10 text-primary/30 animate-pulse-subtle -ml-2" />
          <ChevronRight className="w-10 h-10 text-primary/30 animate-pulse-subtle -mr-2" />
        </div>
      )}

      <div 
        ref={cardRef} 
        style={{...cardStyle, opacity: cardOpacity}}
        className={cn(
          "w-full absolute animate-in fade-in-0 zoom-in-95 duration-300 group-hover:scale-105 group-hover:[filter:drop-shadow(0_0_10px_hsl(var(--primary)/0.5))]",
          isDragging ? "" : "transition-all",
        )}
      >
        <Card className="w-full max-w-sm mx-auto overflow-hidden rounded-lg shadow-lg border-primary/20 bg-card backdrop-blur-sm">
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

    