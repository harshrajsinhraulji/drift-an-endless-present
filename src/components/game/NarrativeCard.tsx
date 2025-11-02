
"use client";

import { useState, useRef, useEffect, useCallback, useContext } from "react";
import * as Lucide from "lucide-react";
import type { CardData, Choice, ResourceId } from "@/lib/game-data";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Leaf, Users, Shield, CircleDollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { SoundContext } from "@/contexts/SoundContext";

interface NarrativeCardProps {
  card: CardData;
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
  const { sfxVolume } = useContext(SoundContext);

  const dragThreshold = 80;

  const handleChoiceMade = useCallback((choice: Choice) => {
    if (sfxVolume > 0) {
      const audio = new Audio('/assets/sounds/card.mp3');
      audio.volume = sfxVolume;
      audio.play().catch(e => console.error("Error playing sound:", e));
    }
    setIsAnimatingOut(true);
    // The onChoice will be called after the animation finishes in the handleDragEnd or handleKeyDown
    setTimeout(() => {
        onChoice(choice);
    }, 300);
  }, [onChoice, sfxVolume]);

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

  const cardOpacity = isAnimatingOut ? 0 : 1;

  const leftChoiceOpacity = isDragging ? Math.max(0, Math.min(1, -dragX / (dragThreshold * 0.75))) : 1;
  const rightChoiceOpacity = isDragging ? Math.max(0, Math.min(1, dragX / (dragThreshold * 0.75))) : 1;

  const isCreatorCard = card.icon === 'Github' || card.icon === 'Linkedin';
  // @ts-ignore
  const Icon = Lucide[card.icon] || Lucide.HelpCircle;

  return (
    <div 
        className="w-full h-[470px] relative select-none group"
    >
      
      {isFirstTurn && (
        <>
          <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-20">
            <ChevronLeft className="w-16 h-16 text-primary/30 animate-pulse-subtle -ml-24" />
            <ChevronRight className="w-16 h-16 text-primary/30 animate-pulse-subtle -mr-24" />
          </div>
        </>
      )}

      <div 
        ref={cardRef} 
        style={{...cardStyle, opacity: cardOpacity}}
        className={cn(
          "w-full h-full absolute animate-in fade-in-0 zoom-in-95 duration-300",
        )}
      >
        <Card 
          className={cn(
            "w-full h-full mx-auto overflow-hidden rounded-lg shadow-lg border-primary/20 bg-card backdrop-blur-sm flex flex-col cursor-grab active:cursor-grabbing",
            "group-hover:scale-105 transition-transform", // Corrected: Moved hover effect here
            isCreatorCard 
              ? "group-hover:[filter:drop-shadow(0_0_15px_hsl(var(--foreground)/0.8))]"
              : "group-hover:[filter:drop-shadow(0_0_10px_hsl(var(--primary)/0.5))]"
          )}
          // Corrected: Moved mouse/touch handlers to the scaling element to prevent flicker
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
        >
          <div className="relative h-24 w-full">
            <div className="absolute inset-0 bg-gradient-to-b from-card via-card/80 to-transparent z-10" />
          </div>
          <CardContent className="p-6 text-center -mt-20 relative z-20 flex-grow">
            <div className="relative h-28 w-28 mx-auto rounded-full border-2 border-primary/50 mb-4 shadow-md flex items-center justify-center bg-card/50">
              <Icon className="w-16 h-16 text-primary/80" />
            </div>
            <h2 className="font-headline text-xl font-bold text-primary mb-2">{card.character}</h2>
            <p className="text-lg font-body text-foreground/90 mb-4 min-h-[100px]">{card.text}</p>

          </CardContent>
           <CardFooter className="p-4 flex justify-between items-end min-h-[90px] gap-4">
            <div style={{ opacity: leftChoiceOpacity }} className="transition-opacity text-center w-1/2 px-2">
              <p className="font-headline text-primary text-base break-words">{card.choices[0].text}</p>
              {showPrescience && <PrescienceDisplay effects={card.choices[0].effects} />}
            </div>
            <div style={{ opacity: rightChoiceOpacity }} className="transition-opacity text-center w-1/2 px-2">
              <p className="font-headline text-primary text-base break-words">{card.choices[1].text}</p>
              {showPrescience && <PrescienceDisplay effects={card.choices[1].effects} />}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

    
