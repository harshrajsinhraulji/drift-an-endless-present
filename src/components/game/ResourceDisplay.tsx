
"use client";

import { useState, useEffect } from "react";
import type { ResourceId } from "@/lib/game-data";
import { Leaf, Users, Shield, CircleDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

type Resources = Record<ResourceId, number>;

interface ResourceDisplayProps {
  resources: Resources;
  effects: Partial<Record<ResourceId, number>>;
  gameOverCause: ResourceId | 'star' | null;
}

const resourceIcons: Record<ResourceId, React.ElementType> = {
  environment: Leaf,
  people: Users,
  army: Shield,
  money: CircleDollarSign,
};

const EffectIndicator = ({ effect }: { effect: number }) => {
  const change = Math.sign(effect);
  // Allow up to 5 dots to represent larger changes
  const magnitude = Math.min(Math.ceil(Math.abs(effect) / 10), 5);

  if (change === 0) return null;

  return (
    // Changed to horizontal flex-row layout
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-row gap-0.5 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      {Array.from({ length: magnitude }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 h-1 rounded-full",
            change > 0 ? "bg-primary" : "bg-destructive"
          )}
        />
      ))}
    </div>
  );
};

export default function ResourceDisplay({ resources, effects, gameOverCause }: ResourceDisplayProps) {
  const [currentEffects, setCurrentEffects] = useState<Partial<Record<ResourceId, number>>>({});

  useEffect(() => {
    if (Object.keys(effects).length > 0) {
      setCurrentEffects(effects);
      const timer = setTimeout(() => {
        setCurrentEffects({});
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [effects]);

  return (
    <div className="flex justify-center items-center gap-6 w-full">
      {(Object.keys(resources) as ResourceId[]).map((id) => {
        const Icon = resourceIcons[id];
        const value = resources[id];
        const dotCount = Math.ceil(value / 10);
        const effect = currentEffects[id];
        const isLow = value <= 20;
        const isHigh = value >= 80;
        const isGameOverCause = gameOverCause === id;

        return (
          <div key={id} className={cn("relative flex flex-col items-center gap-2 transition-all duration-500", isGameOverCause ? "scale-125" : "")}>
            {effect && <EffectIndicator effect={effect} />}
            <Icon className={cn(
                "w-7 h-7 text-primary transition-all duration-300",
                isLow && "animate-pulse text-destructive",
                isHigh && "animate-pulse text-yellow-400",
                isGameOverCause && "text-destructive animate-pulse scale-150"
            )} aria-label={`${id} icon`} />
            <div className="flex flex-col-reverse gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                    i < dotCount ? "bg-primary" : "bg-muted",
                     isLow && i < dotCount && "bg-destructive",
                     isHigh && i < dotCount && "bg-yellow-400",
                     isGameOverCause && "bg-destructive"
                  )}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
