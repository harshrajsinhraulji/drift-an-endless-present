import GameContainer from '@/components/game/GameContainer';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8 overflow-hidden">
      <GameContainer />
      <div className="absolute bottom-4 right-4">
        <Badge variant="outline" className="text-xs font-headline">Year: AD 2024</Badge>
      </div>
    </main>
  );
}
