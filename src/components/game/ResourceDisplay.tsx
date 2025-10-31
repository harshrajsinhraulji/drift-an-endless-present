"use client";

import type { ResourceId } from "@/lib/game-data";
import { Leaf, Users, Shield, CircleDollarSign } from "lucide-react";

type Resources = Record<ResourceId, number>;

interface ResourceDisplayProps {
  resources: Resources;
}

const resourceIcons: Record<ResourceId, React.ElementType> = {
  environment: Leaf,
  people: Users,
  army: Shield,
  money: CircleDollarSign,
};


export default function ResourceDisplay({ resources }: ResourceDisplayProps) {
  return (
    <div className="flex justify-center items-center gap-6 w-full">
      {(Object.keys(resources) as ResourceId[]).map((id) => {
        const Icon = resourceIcons[id];
        const value = resources[id];
        const dotCount = Math.ceil(value / 10);
        return (
          <div key={id} className="flex flex-col items-center gap-2">
            <Icon className="w-7 h-7 text-primary" aria-label={`${id} icon`} />
            <div className="flex flex-col-reverse gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: i < dotCount ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
