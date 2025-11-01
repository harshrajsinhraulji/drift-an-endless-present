
"use client";

import { useState, useEffect, useCallback, useRef, useContext } from "react";
import type { ResourceId, CardData, Choice, StoryFlag } from "@/lib/game-data";
import { gameCards, specialEventCards, INITIAL_RESOURCE_VALUE, gameOverConditions, getCardText } from "@/lib/game-data";
import ResourceDisplay from "./ResourceDisplay";
import NarrativeCard from "./NarrativeCard";
import GameOverDialog from "./GameOverDialog";
import TitleScreen from "./TitleScreen";
import StoryProgressDialog from "./StoryProgressDialog";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Eye } from "lucide-react";
import { SoundContext } from "@/contexts/SoundContext";


type Resources = Record<ResourceId, number>;
type GameState = "title" | "playing" | "gameover" | "creator_intervention";
type StoryFlags = Set<StoryFlag>;

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const SAVE_GAME_KEY = "drift-save-game";

// Helper function to convert Set to Array for JSON serialization
const storyFlagsToJSON = (flags: StoryFlags) => Array.from(flags);
// Helper function to convert Array back to Set after JSON parsing
const storyFlagsFromJSON = (flags: StoryFlag[]) => new Set(flags);


export default function GameContainer() {
  const [resources, setResources] = useState<Resources>({
    environment: INITIAL_RESOURCE_VALUE,
    people: INITIAL_RESOURCE_VALUE,
    army: INITIAL_RESOURCE_VALUE,
    money: INITIAL_RESOURCE_VALUE,
  });
  const [deck, setDeck] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>("title");
  const [gameOverMessage, setGameOverMessage] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [lastEffects, setLastEffects] = useState<Partial<Record<ResourceId, number>>>({});
  const [year, setYear] = useState(0);
  const [hasSave, setHasSave] = useState(false);
  const [storyFlags, setStoryFlags] = useState<StoryFlags>(new Set());
  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false);
  const [prescienceCharges, setPrescienceCharges] = useState(0);
  const [showPrescienceThisTurn, setShowPrescienceThisTurn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { bgmVolume } = useContext(SoundContext);


  useEffect(() => {
    setIsClient(true);
    if (localStorage.getItem(SAVE_GAME_KEY)) {
      setHasSave(true);
    }
     if (!audioRef.current) {
      audioRef.current = new Audio('/assets/sounds/bgm.mp3');
      audioRef.current.loop = true;
    }
  }, []);
  
  useEffect(() => {
    if (audioRef.current) {
      if ((gameState === 'playing' || gameState === 'title') && bgmVolume > 0) {
        audioRef.current.volume = bgmVolume;
        audioRef.current.play().catch(e => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [gameState, bgmVolume]);

  const startNewGame = useCallback((flags: StoryFlags = new Set()) => {
    setResources({
      environment: INITIAL_RESOURCE_VALUE,
      people: INITIAL_RESOURCE_VALUE,
      army: INITIAL_RESOURCE_VALUE,
      money: INITIAL_RESOURCE_VALUE,
    });
    
    const tutorialCard = gameCards.find(c => c.id === 0);
    const regularCards = gameCards.filter(c => c.id !== 0 && !c.isSpecial);
    const shuffledMainDeck = shuffleArray(regularCards);
    
    // Only show the tutorial card on a true new game, not after a "mercy" restart.
    const includeTutorial = !flags.has('creator_github_mercy');
    let initialDeck: CardData[] = [];
    if (includeTutorial && tutorialCard) {
      initialDeck = [tutorialCard, ...shuffledMainDeck];
    } else {
      initialDeck = shuffledMainDeck;
    }
    
    setDeck(initialDeck);
    setCurrentCardIndex(0);
    setGameState("playing");
    setGameOverMessage("");
    setLastEffects({});
    setYear(1);
    setStoryFlags(flags);
    setPrescienceCharges(flags.has('creator_linkedin_prescience') ? 10 : 0);
    setShowPrescienceThisTurn(false);
  }, []);

  const loadGame = useCallback(() => {
    if (!isClient) return;
    const savedState = localStorage.getItem(SAVE_GAME_KEY);
    if (savedState) {
      const { resources, deck, currentCardIndex, year, storyFlags, prescienceCharges } = JSON.parse(savedState);
      setResources(resources);
      setDeck(deck);
      setCurrentCardIndex(currentCardIndex);
      setYear(year);
      setStoryFlags(storyFlagsFromJSON(storyFlags || []));
      setPrescienceCharges(prescienceCharges || 0);
      setGameState("playing");
      setLastEffects({});
      setGameOverMessage("");
      setShowPrescienceThisTurn(false);
    } else {
      startNewGame();
    }
  }, [isClient, startNewGame]);

  useEffect(() => {
    if (isClient && gameState === "playing") {
      const saveState = {
        resources,
        deck,
        currentCardIndex,
        year,
        storyFlags: storyFlagsToJSON(storyFlags),
        prescienceCharges,
      };
      localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(saveState));
      setHasSave(true);
    }
     if (isClient && (gameState === "title" || gameState === "gameover")) {
      localStorage.removeItem(SAVE_GAME_KEY);
      setHasSave(false);
    }
  }, [resources, deck, currentCardIndex, year, storyFlags, gameState, isClient, prescienceCharges]);


  const getNextCard = () => {
    let nextIndex = currentCardIndex + 1;
    let newDeck = [...deck];

    // Function to find the next valid card in the current deck
    const findNextValidCardIndex = (startIndex: number, currentDeck: CardData[]) => {
        let i = startIndex;
        while (i < currentDeck.length) {
            const card = currentDeck[i];
            if (!card) return -1; // Added safety check
            const isBlocked = card.blockedByFlags?.some(flag => storyFlags.has(flag));
            if (!isBlocked) {
                return i;
            }
            i++;
        }
        return -1; // No valid card found
    };
    
    // Check for any story cards that must be injected now
    const isInjectable = (card: CardData) => 
        !deck.some(dCard => dCard.id === card.id) &&
        card.requiredFlags?.every(flag => storyFlags.has(flag)) &&
        !card.blockedByFlags?.some(flag => storyFlags.has(flag));
        
    const storyCardsToInject = gameCards.filter(isInjectable);

    if (storyCardsToInject.length > 0) {
        newDeck.splice(nextIndex, 0, ...storyCardsToInject);
        setDeck(newDeck);
        const nextValid = findNextValidCardIndex(nextIndex, newDeck);
        if (nextValid !== -1) return nextValid;
    }

    let validNextIndex = findNextValidCardIndex(nextIndex, newDeck);
    
    // If no valid card is found, it's time to reshuffle.
    if (validNextIndex === -1) {
        // Get all non-special, non-story-arc cards that have been seen
        const seenStandardCardIds = new Set(deck.slice(0, nextIndex).map(c => c.id));
        const reshuffleableCards = gameCards.filter(c => 
            !c.isSpecial && 
            !c.requiredFlags && 
            seenStandardCardIds.has(c.id) &&
            c.id !== 0 // Don't reshuffle tutorial card
        );

        const newShuffledCards = shuffleArray(reshuffleableCards);
        
        // Append the reshuffled cards to the deck
        const reshuffledDeck = [...newDeck, ...newShuffledCards];
        setDeck(reshuffledDeck);
        
        // Find the next valid card in the newly extended deck
        validNextIndex = findNextValidCardIndex(nextIndex, reshuffledDeck);
    }

    return validNextIndex;
  };

  const handleCreatorIntervention = (choice: Choice) => {
    if (choice.action) choice.action();
    
    if (choice.setFlag === 'creator_github_mercy') {
      const newFlags = new Set(storyFlags);
      newFlags.add('creator_github_mercy');
      // This is a "second chance" from a Game Over state.
      startNewGame(newFlags);
    } else {
      // If they refuse help, it's game over for real.
      setGameState("gameover");
    }
  }


  const handleChoice = (choice: Choice) => {
    const currentCard = deck[currentCardIndex];
    if (gameState !== 'playing' || !currentCard) return;

    if (choice.action) choice.action();

    setLastEffects(choice.effects);

    const newStoryFlags = new Set(storyFlags);
    if (choice.setFlag) {
      newStoryFlags.add(choice.setFlag);
      setStoryFlags(newStoryFlags);
      if (choice.setFlag === 'creator_linkedin_prescience') {
        setPrescienceCharges(10);
      }
    }
    
    if (showPrescienceThisTurn) {
        setPrescienceCharges(p => p - 1);
    }
    setShowPrescienceThisTurn(false);

    let newResources = { ...resources };
    let gameOverTrigger = false;
    let message = "";

    for (const [resource, effect] of Object.entries(choice.effects)) {
      newResources[resource as ResourceId] = Math.max(0, Math.min(100, newResources[resource as ResourceId] + effect));
    }
    
    setResources(newResources);
    
    // Only advance the year for non-tutorial cards
    if (currentCard.id !== 0) {
      setYear(y => y + 1);
    }


    // Special ending for the star child arc
    if (currentCard?.id === 201 && choice.text.includes("Embrace")) {
        gameOverTrigger = true;
        message = gameOverConditions.studied_star_ending;
    } else if (year + 1 >= 50) { // Check against upcoming year
        // Golden Age Victory Condition
        const isBalanced = Object.values(newResources).every(v => v > 30 && v < 70);
        if (isBalanced) {
            gameOverTrigger = true;
            message = gameOverConditions.golden_age;
        }
    }
    
    if (!gameOverTrigger) {
        for (const key in newResources) {
            const resourceId = key as ResourceId;
            if (newResources[resourceId] <= 0) {
                gameOverTrigger = true;
                message = gameOverConditions[`${resourceId}_low`];
                break;
            }
            if (newResources[resourceId] >= 100) {
                gameOverTrigger = true;
                message = gameOverConditions[`${resourceId}_high`];
                break;
            }
        }
    }

    if (year > 10 && !storyFlags.has('creator_linkedin_prescience') && !deck.some(c => c.id === 303) && Math.random() < 0.2) {
      const creatorCard = gameCards.find(c => c.id === 303);
      if(creatorCard) {
        const newDeck = [...deck];
        newDeck.splice(currentCardIndex + 1, 0, creatorCard);
        setDeck(newDeck);
        setCurrentCardIndex(currentCardIndex + 1);
        return;
      }
    }

    if (gameOverTrigger) {
      setGameOverMessage(message);
      if (isClient) localStorage.removeItem(SAVE_GAME_KEY);

      if (!storyFlags.has('creator_github_mercy')) {
        setGameState("creator_intervention");
      } else {
        setGameState("gameover");
      }

    } else {
       const nextCardIndex = getNextCard();
       if (nextCardIndex !== -1) {
         setCurrentCardIndex(nextCardIndex);
       } else {
         // This should theoretically not be reached with the new logic, but as a fallback:
         setGameOverMessage("You have seen all that this timeline has to offer. The world fades to dust.");
         setGameState("gameover");
       }
    }
  };

  const returnToTitle = () => {
    setGameState("title");
  }

  const togglePrescience = () => {
    if (prescienceCharges > 0) {
      setShowPrescienceThisTurn(!showPrescienceThisTurn);
    }
  };

  const currentCard = deck[currentCardIndex];
  const cardText = currentCard ? getCardText(currentCard, resources) : "";
  const creatorCard = gameCards.find(c => c.id === 302);
  
  if (!isClient) {
    return (
        <div className="flex flex-col gap-6 h-[600px] w-full max-w-2xl items-center justify-center">
            <div className="w-full h-10" />
            <div className="flex h-[470px] w-full items-center justify-center rounded-lg bg-card/50">
                <h1 className="font-headline text-2xl text-primary">LOADING...</h1>
            </div>
            <div className="h-8" />
        </div>
    );
  }

  if (gameState === "title") {
    return <TitleScreen onStart={() => startNewGame()} onContinue={loadGame} hasSave={hasSave} />;
  }

  if (gameState === "creator_intervention" && creatorCard) {
    return (
       <div className="flex flex-col gap-6 items-center w-full max-w-2xl">
        <div className="w-full mx-auto flex flex-col gap-6 z-10">
          <ResourceDisplay resources={resources} effects={{}} />
          <NarrativeCard
            key={creatorCard.id}
            card={{ ...creatorCard, text: getCardText(creatorCard, resources)}}
            onChoice={handleCreatorIntervention}
            showPrescience={false}
          />
        </div>
        <p className="text-primary font-headline text-2xl h-8">{year}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center w-full max-w-2xl">
      <div className={cn("w-full mx-auto flex flex-col gap-6 z-10 transition-opacity duration-500", gameState === 'gameover' ? "opacity-30" : "opacity-100")}>
        <ResourceDisplay resources={resources} effects={lastEffects} />
        {currentCard && (
            <NarrativeCard
              key={currentCard.id}
              card={{ ...currentCard, text: cardText}}
              onChoice={handleChoice}
              showPrescience={showPrescienceThisTurn}
              isFirstTurn={year === 1 && currentCard.id === 0}
            />
        )}
      </div>
      <p className="text-primary font-headline text-2xl h-8 transition-opacity duration-300" style={{opacity: gameState !== 'playing' || currentCard?.id === 0 ? 0 : 1}}>{year}</p>
      <GameOverDialog isOpen={gameState === "gameover"} message={gameOverMessage} onRestart={returnToTitle} />
       <div className="absolute bottom-4 right-4 flex items-center gap-2">
            {storyFlags.has('creator_linkedin_prescience') && (
              <Button onClick={togglePrescience} variant={showPrescienceThisTurn ? 'default' : 'outline'} size="sm" className="text-xs font-headline" disabled={prescienceCharges <= 0}>
                <Eye className="w-4 h-4 mr-1" />
                {prescienceCharges}
              </Button>
            )}
          <Button onClick={() => setIsStoryDialogOpen(true)} variant="outline" size="sm" className="text-xs font-headline">
            Year: {year}
          </Button>
      </div>
      <StoryProgressDialog isOpen={isStoryDialogOpen} onClose={() => setIsStoryDialogOpen(false)} flags={Array.from(storyFlags)} />
    </div>
  );
}

    