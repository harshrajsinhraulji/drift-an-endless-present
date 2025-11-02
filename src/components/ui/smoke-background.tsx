"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const SmokeBackground = ({
  children,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  return (
    <div
      className={cn(
        "relative h-full w-full bg-background",
        containerClassName
      )}
    >
      <div
        className={cn(
          "absolute inset-0 z-0 h-full w-full animate-smoke-in bg-[radial-gradient(ellipse_100%_40%_at_50%_60%,hsl(var(--primary)/0.08),transparent)]",
          className
        )}
      />
      {children}
    </div>
  );
};
