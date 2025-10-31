
"use client";

import { useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { SoundContext } from "@/contexts/SoundContext";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { bgmVolume, setBgmVolume, sfxVolume, setSfxVolume } = useContext(SoundContext);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary text-center">Settings</DialogTitle>
          <DialogDescription className="text-lg text-foreground/80 pt-2 text-center">
            Adjust your game experience.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="grid gap-3">
                <Label htmlFor="bgm-volume" className="font-headline text-base text-foreground/90">Background Music</Label>
                <Slider
                    id="bgm-volume"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[bgmVolume]}
                    onValueChange={(value) => setBgmVolume(value[0])}
                />
            </div>
            <div className="grid gap-3">
                <Label htmlFor="sfx-volume" className="font-headline text-base text-foreground/90">Sound Effects</Label>
                <Slider
                    id="sfx-volume"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[sfxVolume]}
                    onValueChange={(value) => setSfxVolume(value[0])}
                />
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
