
"use client";

import { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import SettingsDialog from "./SettingsDialog";
import { Cog, LogOut, Trophy, Github, Linkedin } from "lucide-react";
import { signInWithGoogle, signOutUser, signUpWithEmail, signInWithEmail, signInAnonymously } from "@/firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useFirestore, useUser } from "@/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import LeaderboardsDialog from "./LeaderboardsDialog";
import { SoundContext } from "@/contexts/SoundContext";


interface TitleScreenProps {
  onStart: () => void;
  onContinue: () => void;
  hasSave: boolean;
  onDeleteSave: () => Promise<void>;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
}

const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'The sigil or incantation is incorrect. Check your credentials.';
        case 'auth/invalid-email':
            return 'The provided email is not a valid sigil.';
        case 'auth/email-already-in-use':
            return 'This sigil is already bound to another ruler.';
        case 'auth/weak-password':
            return 'Your incantation is too weak. It must be at least 6 characters long.';
        default:
            return 'A mysterious force has prevented your ascension. Please try again.';
    }
}

export default function TitleScreen({ onStart, onContinue, hasSave, onDeleteSave }: TitleScreenProps) {
  const { user } = useUser();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeaderboardsOpen, setIsLeaderboardsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isNewGameConfirmOpen, setNewGameConfirmOpen] = useState(false);
  const [isAnonymousConfirmOpen, setAnonymousConfirmOpen] = useState(false);
  
  const [isUsernameModalOpen, setUsernameModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const firestore = useFirestore();
  const { sfxVolume } = useContext(SoundContext);

  const playClickSound = () => {
    if (sfxVolume > 0) {
      const audio = new Audio('/assets/sounds/click.mp3');
      audio.volume = sfxVolume;
      audio.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  useEffect(() => {
    if (!user || !firestore) {
      setUserProfile(null);
      return;
    }

    // Anonymous users don't have persistent profiles in the same way
    if (user.isAnonymous) {
      setUserProfile({ id: user.uid, username: 'Wanderer', email: '' });
      setUsernameModalOpen(false);
      return;
    }

    const profileRef = doc(firestore, 'users', user.uid);
    const unsubscribe = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile;
        setUserProfile(profile);
        if (!profile.username) {
          setUsernameModalOpen(true);
        }
      } else {
        const newProfileData: UserProfile = {
          id: user.uid,
          email: user.email || '',
          username: user.displayName || '',
        };
        setDoc(profileRef, newProfileData).catch(e => console.error("Failed to create user profile", e));
        if (!newProfileData.username) {
            setUsernameModalOpen(true);
        }
      }
    });

    return () => unsubscribe();
  }, [user, firestore]);

  const handleUsernameSubmit = async () => {
    if (!user || !firestore || user.isAnonymous || !newUsername.trim()) {
        setError("A name cannot be empty.");
        return;
    };
    setError('');
    const profileRef = doc(firestore, 'users', user.uid);
    try {
      await setDoc(profileRef, { username: newUsername.trim() }, { merge: true });
      setUsernameModalOpen(false);
    } catch (e) {
      setError("Failed to etch the name. Please try again.");
    }
  };

  const handleNewGameClick = () => {
    playClickSound();
    if (hasSave) {
      setNewGameConfirmOpen(true);
    } else {
      onStart();
    }
  };

  const handleNewGameConfirm = async () => {
    playClickSound();
    await onDeleteSave();
    onStart();
    setNewGameConfirmOpen(false);
  };

  const handleAuthAction = async (action: () => Promise<any>) => {
    playClickSound();
    setError('');
    try {
      await action();
    } catch (e: any) {
      setError(getAuthErrorMessage(e.code));
    }
  };

  const handleAnonymousContinue = async () => {
    await handleAuthAction(signInAnonymously);
    setAnonymousConfirmOpen(false);
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full max-w-7xl flex-col items-center justify-center p-4 sm:p-8">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-96 h-96">
              <div className="absolute inset-0 border-[2px] border-primary/10 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-8 border-[1px] border-primary/10 rounded-full animate-spin-slow [animation-direction:reverse]"></div>
              <div className="absolute inset-16 border-[1px] border-primary/5 rounded-full animate-spin-slow"></div>
          </div>
        </div>
        
        {user && userProfile && (
           <div className="absolute top-4 right-4 z-20 flex items-center gap-4 text-foreground/80">
              <span>{userProfile.username || user.email}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => handleAuthAction(signOutUser)} variant="ghost" size="icon">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Abdicate (Sign Out)</p>
                </TooltipContent>
              </Tooltip>
           </div>
        )}

        <div className="z-10 flex flex-grow flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-2 mb-16 text-center">
              <h1 className="font-headline text-8xl text-primary tracking-wider">DRIFT</h1>
              <p className="font-body text-2xl text-foreground/80">An Endless Present</p>
            </div>
            
            {user && userProfile ? (
              <div className="flex flex-col items-center gap-6">
                {hasSave && (
                    <Button onClick={() => { playClickSound(); onContinue(); }} size="lg" className="w-64 font-headline text-xl">
                        Continue Your Reign
                    </Button>
                )}
                <Button onClick={handleNewGameClick} size="lg" variant="outline" className="w-64 font-headline text-xl">
                  Begin a New Reign
                </Button>
              </div>
            ) : (
                <div className="w-full max-w-sm">
                  <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="signin">Ascend to the Throne</TabsTrigger>
                      <TabsTrigger value="register">Claim Your Birthright</TabsTrigger>
                    </TabsList>
                    <TabsContent value="signin">
                      <Card>
                        <CardHeader>
                          <CardTitle>Sign In</CardTitle>
                          <CardDescription>
                            Access your past reigns.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                          <div className="space-y-2">
                            <Label htmlFor="email-in">Email Sigil</Label>
                            <Input id="email-in" type="email" placeholder="ruler@kingdom.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password-in">Secret Incantation</Label>
                            <Input id="password-in" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                          </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-4">
                          <Button onClick={() => handleAuthAction(() => signInWithEmail(email, password))} className="w-full">Sign In</Button>
                          <Button onClick={() => handleAuthAction(signInWithGoogle)} variant="outline" className="w-full">Use Google Insignia</Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                    <TabsContent value="register">
                      <Card>
                        <CardHeader>
                          <CardTitle>Register</CardTitle>
                          <CardDescription>
                            Begin your legacy.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                          <div className="space-y-2">
                            <Label htmlFor="email-up">Email Sigil</Label>
                            <Input id="email-up" type="email" placeholder="ruler@kingdom.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password-up">Secret Incantation</Label>
                            <Input id="password-up" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                          </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-4">
                          <Button onClick={() => handleAuthAction(() => signUpWithEmail(email, password))} className="w-full">Register</Button>
                          <Button onClick={() => handleAuthAction(signInWithGoogle)} variant="outline" className="w-full">Use Google Insignia</Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                  </Tabs>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>
                  <Button onClick={() => { playClickSound(); setAnonymousConfirmOpen(true); }} variant="secondary" className="w-full font-headline text-lg">Enter the Drift</Button>
                </div>
            )}
        </div>
        
        <div className="flex justify-center items-center gap-6 z-10 py-4">
          <Tooltip>
            <TooltipTrigger asChild>
                <Button onClick={() => { playClickSound(); setIsLeaderboardsOpen(true); }} variant="ghost" size="icon" className="text-foreground/60 hover:text-primary" disabled={!userProfile}>
                    <Trophy className="w-6 h-6" />
                    <span className="sr-only">Leaderboards</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View the Legends of the Realm</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => window.open('https://github.com/harshrajsinhraulji/drift-an-endless-present', '_blank')} variant="ghost" size="icon" className="text-foreground/60 hover:text-primary">
                  <Github className="w-6 h-6" />
                  <span className="sr-only">GitHub</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View the source on GitHub</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => window.open('https://www.linkedin.com/in/harshrajsinhraulji/', '_blank')} variant="ghost" size="icon" className="text-foreground/60 hover:text-primary">
                  <Linkedin className="w-6 h-6" />
                  <span className="sr-only">LinkedIn</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Connect with the creator</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => { playClickSound(); setIsSettingsOpen(true); }} variant="ghost" size="icon" className="text-foreground/60 hover:text-primary">
                  <Cog className="w-6 h-6" />
                  <span className="sr-only">Settings</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adjust game settings</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <LeaderboardsDialog isOpen={isLeaderboardsOpen} onClose={() => setIsLeaderboardsOpen(false)} userProfile={userProfile} />

        <Dialog open={isNewGameConfirmOpen} onOpenChange={setNewGameConfirmOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle className="font-headline text-2xl text-primary text-center">Begin a New Reign?</DialogTitle>
                  <DialogDescription className="text-lg text-foreground/80 pt-4 text-center">
                      Starting a new reign will cause your past life to be lost to the sands of time. This history cannot be restored.
                  </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center pt-4 gap-2">
                  <Button variant="outline" onClick={() => { playClickSound(); setNewGameConfirmOpen(false); }}>Cancel</Button>
                  <Button variant="destructive" onClick={handleNewGameConfirm}>Erase the Past</Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAnonymousConfirmOpen} onOpenChange={setAnonymousConfirmOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle className="font-headline text-2xl text-primary text-center">Walk the Path Unremembered?</DialogTitle>
                  <DialogDescription className="text-lg text-foreground/80 pt-4 text-center">
                    Anonymous reigns are like whispers in the wind—their histories are not permanently etched. If you clear your browser's memory, your progress will be lost. Do you wish to proceed?
                  </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center pt-4 gap-2">
                  <Button variant="outline" onClick={() => { playClickSound(); setAnonymousConfirmOpen(false); }}>Cancel</Button>
                  <Button onClick={handleAnonymousContinue}>Proceed</Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isUsernameModalOpen} onOpenChange={(open) => { if (!open && !userProfile?.username) return; setUsernameModalOpen(open)}}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl text-primary text-center">What is your name, Ruler?</DialogTitle>
              <DialogDescription className="text-lg text-foreground/80 pt-4 text-center">
                Your people must know what to call you. This name will be etched into the leaderboards for all eternity.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 pt-4">
              <Label htmlFor="username">Royal Name</Label>
              <Input id="username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Pharaoh..." />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter className="pt-4">
              <Button className="w-full" onClick={handleUsernameSubmit}>Claim Your Name</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
