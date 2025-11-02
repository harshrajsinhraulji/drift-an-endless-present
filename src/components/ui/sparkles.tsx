
"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const SparklesCore = (props: {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
  speed?: number;
}) => {
  const {
    id,
    background,
    minSize,
    maxSize,
    particleDensity,
    className,
    particleColor,
    speed,
  } = props;
  const [sparkles, setSparkles] = useState<any[]>([]);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  }>({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    const canvas = document.getElementById(id || "sparkles-canvas");
    if (canvas instanceof HTMLCanvasElement) {
      setCanvas(canvas);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        setCtx(ctx);
      }
    }
  }, [id]);

  useEffect(() => {
    if (canvas && ctx) {
      canvas.width = windowSize.width;
      canvas.height = windowSize.height;

      const numParticles = Math.floor(
        (canvas.width * canvas.height * (particleDensity || 20)) / 100000
      );

      const newSparkles = Array.from({ length: numParticles }, () => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size =
          Math.random() * ((maxSize || 2) - (minSize || 0.5)) + (minSize || 0.5);
        const speed = Math.random() * (props.speed || 1) + 0.5;
        return { x, y, size, speed };
      });
      setSparkles(newSparkles);
    }
  }, [canvas, ctx, windowSize, particleDensity, maxSize, minSize, props.speed]);

  useEffect(() => {
    if (!canvas || !ctx) return;

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sparkles.forEach((sparkle) => {
        sparkle.y += sparkle.speed;
        if (sparkle.y > canvas.height) {
          sparkle.y = 0;
          sparkle.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, 2 * Math.PI);
        ctx.fillStyle = particleColor || "white";
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [sparkles, canvas, ctx, particleColor]);

  if (!isClient) {
    return null;
  }

  return (
    <canvas
      id={id || "sparkles-canvas"}
      className={cn("absolute inset-0 z-0", className)}
      style={{
        backgroundColor: background || "transparent",
      }}
    ></canvas>
  );
};
