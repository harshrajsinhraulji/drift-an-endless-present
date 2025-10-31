
import GameContainer from '@/components/game/GameContainer';
import { SoundProvider } from '@/contexts/SoundContext';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8 overflow-hidden">
      <SoundProvider>
        <GameContainer />
      </SoundProvider>
    </main>
  );
}
