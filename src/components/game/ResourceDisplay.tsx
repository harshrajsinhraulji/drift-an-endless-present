"use client";

import type { ResourceId } from "@/lib/game-data";
import { Progress } from "@/components/ui/progress";
import { Swords, Landmark, Users, BrainCircuit } from "lucide-react";

type Resources = Record<ResourceId, number>;

interface ResourceDisplayProps {
  resources: Resources;
}

const resourceIcons: Record<ResourceId, React.ElementType> = {
  military: Swords,
  treasury: Landmark,
  publicApproval: Users,
  technology: BrainCircuit,
};

const resourceNames: Record<ResourceId, string> = {
    military: "Military",
    treasury: "Treasury",
    publicApproval: "Approval",
    technology: "Tech",
}

export default function ResourceDisplay({ resources }: ResourceDisplayProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
      {(Object.keys(resources) as ResourceId[]).map((id) => {
        const Icon = resourceIcons[id];
        const value = resources[id];
        const name = resourceNames[id];
        return (
          <div key={id} className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Icon className="w-6 h-6 text-primary icon-glow" aria-label={`${name} icon`} />
              <span className="font-headline text-lg text-glow">{name}</span>
            </div>
            <div className="w-full bg-card/50 rounded-full h-2.5 border border-primary/20">
                <div 
                    className="bg-primary h-full rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${value}%`, boxShadow: `0 0 8px hsl(var(--primary))` }}
                ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
