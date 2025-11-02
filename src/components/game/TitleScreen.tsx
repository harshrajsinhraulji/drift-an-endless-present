
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import SettingsDialog from "./SettingsDialog";
import { Cog, Crown, Swords, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { signInWithGoogle, signOutUser, signUpWithEmail, signInWithEmail } from "@/firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { User } from "firebase/auth";
import { useFirestore } from "@/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

interface TitleScreenProps {
  onStart: () => void;
  onContinue: () => void;
  hasSave: boolean;
  user: User | null;
  onDeleteSave: () => Promise<void>;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
}

const LeaderboardEntry = ({ rank, username, score, icon }: { rank: number; username: string; score: number; icon: React.ElementType }) => {
  const Icon = icon;
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-3">
        <span className={cn("font-bold w-6 text-center", rank <= 3 && "text-primary")}>{rank}</span>
        <span className="truncate">{username}</span>
      </div>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary/80" />
        <span className="font-bold">{score}</span>
      </div>
    </div>
  );
};

export default function TitleScreen({ onStart, onContinue, hasSave, user, onDeleteSave }: TitleScreenProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isNewGameConfirmOpen, setNewGameConfirmOpen] = useState(false);
  
  const [isUsernameModalOpen, setUsernameModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const firestore = useFirestore();

  useEffect(() => {
    if (!user || !firestore) {
      setUserProfile(null);
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
        // Create a profile if it doesn't exist
        const newProfile: UserProfile = {
          id: user.uid,
          email: user.email || '',
          username: '',
        };
        setDoc(profileRef, newProfile).catch(e => console.error("Failed to create user profile", e));
      }
    });

    return () => unsubscribe();
  }, [user, firestore]);

  const handleUsernameSubmit = async () => {
    if (!user || !firestore || !newUsername.trim()) return;
    const profileRef = doc(firestore, 'users', user.uid);
    try {
      await setDoc(profileRef, { username: newUsername.trim() }, { merge: true });
      setUsernameModalOpen(false);
    } catch (e) {
      console.error("Failed to set username:", e);
      setError("Failed to set username. Please try again.");
    }
  };

  const handleNewGameClick = () => {
    if (hasSave) {
      setNewGameConfirmOpen(true);
    } else {
      onStart();
    }
  };

  const handleNewGameConfirm = async () => {
    await onDeleteSave();
    onStart();
    setNewGameConfirmOpen(false);
  };

  const handleAuthAction = async (action: () => Promise<any>) => {
    setError('');
    try {
      await action();
    } catch (e: any) {
      setError(e.message.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, ''));
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full max-w-4xl animate-in fade-in-0 duration-500 overflow-y-auto p-4 sm:p-6">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-96 h-96">
            <div className="absolute inset-0 border-[2px] border-primary/10 rounded-full animate-spin-slow"></div>
            <div className="absolute inset-8 border-[1px] border-primary/10 rounded-full animate-spin-slow [animation-direction:reverse]"></div>
            <div className="absolute inset-16 border-[1px] border-primary/5 rounded-full animate-spin-slow"></div>
        </div>
      </div>

       <div className="z-10 flex flex-col items-center justify-center w-full flex-grow">
          <div className="flex flex-col items-center gap-2 mb-8 text-center">
            <h1 className="font-headline text-7xl text-primary tracking-wider">DRIFT</h1>
            <p className="font-body text-xl text-foreground/80">An Endless Present</p>
          </div>
          
          {user && userProfile ? (
             <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card className="bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Ruler</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-between items-center">
                            <p className="text-lg font-headline text-primary">{userProfile.username || user.email}</p>
                            <Button onClick={() => handleAuthAction(signOutUser)} variant="ghost" size="sm">
                                Abdicate
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Chronicles</CardTitle>
                        <CardDescription>
                          Your journey is written in the stars.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 gap-4">
                        <Button onClick={onContinue} size="lg" className="w-full font-headline text-xl" disabled={!hasSave}>
                          Continue Your Reign
                          <span className="text-sm block text-primary-foreground/70 -mt-1">A past life awaits.</span>
                        </Button>
                        <Button onClick={handleNewGameClick} size="lg" variant="outline" className="w-full font-headline text-xl">
                          Begin Anew
                           <span className="text-sm block text-foreground/70 -mt-1">Forge a new destiny.</span>
                        </Button>
                      </CardContent>
                    </Card>
                </div>
                 <div className="space-y-6">
                    <Card className="bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Kingdom Leaderboards</CardTitle>
                             <CardDescription>Legends of the past and present.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="font-headline text-primary">Longest Dynasty</h4>
                                <LeaderboardEntry rank={1} username="Pharaoh Ramses II" score={120} icon={Crown} />
                                <LeaderboardEntry rank={2} username="Cleopatra" score={98} icon={Crown} />
                                {userProfile.username && <LeaderboardEntry rank={24} username={userProfile.username} score={12} icon={Crown} />}
                            </div>
                             <div className="space-y-2">
                                <h4 className="font-headline text-primary">Largest Army</h4>
                                <LeaderboardEntry rank={1} username="General Tso" score={95} icon={Swords} />
                                <LeaderboardEntry rank={2} username="Alexander" score={92} icon={Swords} />
                            </div>
                              <div className="space-y-2">
                                <h4 className="font-headline text-primary">Highest Approval</h4>
                                <LeaderboardEntry rank={1} username="Queen of Sheba" score={99} icon={Users} />
                                <LeaderboardEntry rank={2} username="Marcus Aurelius" score={96} icon={Users} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
          ) : (
            <Tabs defaultValue="signin" className="w-full max-w-sm">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
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
                      <Label htmlFor="email-in">Email</Label>
                      <Input id="email-in" type="email" placeholder="ruler@kingdom.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-in">Password</Label>
                      <Input id="password-in" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-4">
                    <Button onClick={() => handleAuthAction(() => signInWithEmail(email, password))} className="w-full">Sign In</Button>
                    <Button onClick={() => handleAuthAction(signInWithGoogle)} variant="outline" className="w-full">Sign In with Google</Button>
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
                      <Label htmlFor="email-up">Email</Label>
                      <Input id="email-up" type="email" placeholder="ruler@kingdom.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-up">Password</Label>
                      <Input id="password-up" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-4">
                    <Button onClick={() => handleAuthAction(() => signUpWithEmail(email, password))} className="w-full">Register</Button>
                     <Button onClick={() => handleAuthAction(signInWithGoogle)} variant="outline" className="w-full">Sign up with Google</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          )}
      </div>
      
      <div className="w-full flex justify-center items-center gap-6 z-10 py-4">
         <Button onClick={() => setIsSettingsOpen(true)} variant="ghost" size="icon" className="text-foreground/60 hover:text-primary">
            <Cog className="w-6 h-6" />
            <span className="sr-only">Settings</span>
        </Button>
      </div>

      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <Dialog open={isNewGameConfirmOpen} onOpenChange={setNewGameConfirmOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline text-2xl text-primary text-center">Begin Anew?</DialogTitle>
                <DialogDescription className="text-lg text-foreground/80 pt-4 text-center">
                    Starting a new reign will cause your past life to be lost to the sands of time. This history cannot be restored.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center pt-4 gap-2">
                <Button variant="outline" onClick={() => setNewGameConfirmOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleNewGameConfirm}>Erase the Past</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUsernameModalOpen} onOpenChange={setUsernameModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary text-center">What is your name, Ruler?</DialogTitle>
             <DialogDescription className="text-lg text-foreground/80 pt-4 text-center">
              Your people must know what to call you. This name will be etched into the leaderboards.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-4">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Pharaoh..." />
             {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter className="pt-4">
            <Button className="w-full" onClick={handleUsernameSubmit}>Claim Your Name</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
