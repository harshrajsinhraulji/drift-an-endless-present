
"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GameHistoryEvent } from "@/hooks/useGame";
import { Separator } from "../ui/separator";

interface HistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  history: GameHistoryEvent[];
}

export default function HistoryDialog({ isOpen, onClose, history }: HistoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl text-primary text-center">Chronicle of Your Reign</DialogTitle>
          <DialogDescription className="text-lg text-foreground/80 pt-2 text-center">
            A history of the choices that defined your time as ruler.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] mt-4 pr-6">
            <div className="flex flex-col gap-6">
                {history.length > 0 ? (
                    history.map((event, index) => (
                        <div key={index} className="flex flex-col gap-4">
                            <div>
                                <p className="font-headline text-xl text-primary">Year {event.year}</p>
                                <p className="text-sm text-muted-foreground">You spoke with {event.card.character}.</p>
                            </div>
                            <blockquote className="border-l-2 border-border pl-4 text-foreground/80">
                                "{event.text}"
                            </blockquote>
                            <p className="text-base text-foreground">
                                You chose to: <span className="font-semibold text-primary/90">"{event.choice.text}"</span>
                            </p>
                            {index < history.length - 1 && <Separator className="mt-2"/>}
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground pt-10">Your history has not yet been written.</p>
                )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
