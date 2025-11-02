
'use client';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInAnonymously as firebaseSignInAnonymously,
} from 'firebase/auth';
import { initializeFirebase } from './';

const { auth } = initializeFirebase();
const googleProvider = new GoogleAuthProvider();

export const signUpWithEmail = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

export const signInAnonymously = () => {
  return firebaseSignInAnonymously(auth);
}

export const signOutUser = () => {
  return signOut(auth);
};
