
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import SettingsDialog from "./SettingsDialog";
import { Settings, Github, Linkedin, Cog } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { signInWithGoogle, signOutUser, signUpWithEmail, signInWithEmail } from "@/firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TitleScreenProps {
  onStart: () => void;
  onContinue: () => void;
  hasSave: boolean;
}

export default function TitleScreen({ onStart, onContinue, hasSave }: TitleScreenProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailSignUp = async () => {
    setError('');
    try {
      await signUpWithEmail(email, password);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleEmailSignIn = async () => {
    setError('');
    try {
      await signInWithEmail(email, password);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-full max-w-2xl animate-in fade-in-0 duration-500 overflow-hidden p-6">
      
      {/* Background visual element */}
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
          
           <Tabs defaultValue="signin" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <Card>
                <CardHeader>
                   <CardTitle>Welcome Back</CardTitle>
                   <CardDescription>Sign in to continue your journey.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" type="email" placeholder="pharaoh@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input id="signin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                   {error && <p className="text-sm text-destructive">{error}</p>}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button className="w-full" onClick={handleEmailSignIn}>Sign In</Button>
                  <Button variant="outline" className="w-full" onClick={signInWithGoogle}>Sign In with Google</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="register">
               <Card>
                <CardHeader>
                   <CardTitle>Begin Your Reign</CardTitle>
                   <CardDescription>Create an account to save your progress.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input id="register-email" type="email" placeholder="pharaoh@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input id="register-password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button className="w-full" onClick={handleEmailSignUp}>Register with Email</Button>
                   <Button variant="outline" className="w-full" onClick={signInWithGoogle}>Sign Up with Google</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

      </div>
      
      <div className="w-full flex justify-center items-center gap-6 z-10 pb-4">
         <Button onClick={() => setIsSettingsOpen(true)} variant="ghost" size="icon" className="text-foreground/60 hover:text-primary">
            <Cog className="w-6 h-6" />
            <span className="sr-only">Settings</span>
        </Button>
        <Link href="https://github.com/harshrajsinhraulji" target="_blank" rel="noopener noreferrer" className={cn(
            "text-foreground/60 hover:text-primary transition-colors",
        )}>
            <Github className="w-6 h-6" />
            <span className="sr-only">GitHub</span>
        </Link>
         <Link href="https://www.linkedin.com/in/harshrajsinhraulji" target="_blank" rel="noopener noreferrer" className={cn(
            "text-foreground/60 hover:text-primary transition-colors",
        )}>
            <Linkedin className="w-6 h-6" />
            <span className="sr-only">LinkedIn</span>
        </Link>
      </div>

      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
