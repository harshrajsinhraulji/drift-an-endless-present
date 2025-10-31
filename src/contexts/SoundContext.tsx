
"use client";

import { createContext, useState, useEffect, type ReactNode } from "react";

interface SoundContextType {
  bgmVolume: number;
  setBgmVolume: (volume: number) => void;
  sfxVolume: number;
  setSfxVolume: (volume: number) => void;
}

export const SoundContext = createContext<SoundContextType>({
  bgmVolume: 1,
  setBgmVolume: () => {},
  sfxVolume: 1,
  setSfxVolume: () => {},
});

const BGM_VOLUME_KEY = "drift-bgm-volume";
const SFX_VOLUME_KEY = "drift-sfx-volume";

export function SoundProvider({ children }: { children: ReactNode }) {
  const [bgmVolume, setBgmVolumeState] = useState(1);
  const [sfxVolume, setSfxVolumeState] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedBgm = localStorage.getItem(BGM_VOLUME_KEY);
      if (storedBgm !== null) {
        setBgmVolumeState(parseFloat(storedBgm));
      }
      const storedSfx = localStorage.getItem(SFX_VOLUME_KEY);
      if (storedSfx !== null) {
        setSfxVolumeState(parseFloat(storedSfx));
      }
    } catch (error) {
        console.error("Could not load sound settings from localStorage", error);
    }
  }, []);

  const setBgmVolume = (volume: number) => {
    if (isMounted) {
      localStorage.setItem(BGM_VOLUME_KEY, String(volume));
      setBgmVolumeState(volume);
    }
  };

  const setSfxVolume = (volume: number) => {
    if (isMounted) {
      localStorage.setItem(SFX_VOLUME_KEY, String(volume));
      setSfxVolumeState(volume);
    }
  };
  
  if (!isMounted) {
    // Avoid hydration mismatch by not rendering children until settings are loaded
    return null;
  }

  return (
    <SoundContext.Provider value={{ bgmVolume, setBgmVolume, sfxVolume, setSfxVolume }}>
      {children}
    </SoundContext.Provider>
  );
}
