
'use client';
import Game from '@/components/game/Game';
import { SoundProvider } from '@/contexts/SoundContext';
import { FirebaseClientProvider } from '@/firebase';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8 overflow-hidden">
      <FirebaseClientProvider>
        <SoundProvider>
          <Game />
        </SoundProvider>
      </FirebaseClientProvider>
    </main>
  );
}
