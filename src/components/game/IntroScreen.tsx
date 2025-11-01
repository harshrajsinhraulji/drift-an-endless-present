"use client";

interface IntroScreenProps {
  onFinish: () => void;
}

const ChariotWheel = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    className="absolute inset-0 m-auto h-[90vmin] w-[90vmin] animate-spin-slow opacity-10 text-primary"
    fill="none"
    stroke="currentColor"
    strokeWidth="0.5"
  >
    <circle cx="50" cy="50" r="48" />
    <circle cx="50" cy="50" r="8" />
    {[...Array(12)].map((_, i) => (
      <line
        key={i}
        x1="50"
        y1="50"
        x2={50 + 40 * Math.cos((i * Math.PI) / 6)}
        y2={50 + 40 * Math.sin((i * Math.PI) / 6)}
      />
    ))}
  </svg>
);


export default function IntroScreen({ onFinish }: IntroScreenProps) {
  return (
    <div
      className="flex h-screen w-screen cursor-pointer flex-col items-center justify-center bg-background animate-in fade-in-0 duration-1000"
      onClick={onFinish}
    >
      <ChariotWheel />
      <div className="z-10 flex flex-col items-center gap-2 text-center">
        <h1 className="font-headline text-5xl text-primary tracking-wider">DRIFT</h1>
        <p className="font-body text-lg text-foreground/80">An Endless Present</p>
      </div>
      <p className="absolute bottom-10 z-10 font-body text-sm text-muted-foreground animate-pulse">
        Click anywhere to begin
      </p>
    </div>
  );
}
