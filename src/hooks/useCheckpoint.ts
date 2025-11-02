
'use client';

import { useMemo, useCallback, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { useFirestore } from '@/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Resources, StoryFlags } from './useGame';
import { storyFlagsFromJSON } from './useGame';

export interface Checkpoint {
    userId: string;
    resources: Resources;
    deckIds: number[];
    currentCardIndex: number;
    year: number;
    cardInYearCount: number;
    cardsPerYear: number;
    storyFlags: any[]; // Serialized from Set
    prescienceCharges: number;
    tutorialCompleted: boolean;
    updatedAt: string;
}

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

export const useCheckpoint = (
    user: User | null,
    hasSave?: boolean,
    setHasSave?: (hasSave: boolean) => void,
    setIsCheckingSave?: (isChecking: boolean) => void
) => {
    const firestore = useFirestore();

    const saveCheckpoint = useMemo(() => debounce((saveState: Checkpoint) => {
        if (user && firestore && !user.isAnonymous) {
            const checkpointRef = doc(firestore, 'users', user.uid, 'checkpoints', 'main');
            setDocumentNonBlocking(checkpointRef, saveState, { merge: true });
        }
    }, 1500), [user, firestore]);

    const deleteCheckpoint = useCallback(async () => {
        if (user && firestore && !user.isAnonymous) {
            const checkpointRef = doc(firestore, 'users', user.uid, 'checkpoints', 'main');
            try {
                await deleteDoc(checkpointRef);
                if (setHasSave) setHasSave(false);
            } catch (serverError) {
                const permissionError = new FirestorePermissionError({
                    path: checkpointRef.path,
                    operation: 'delete',
                });
                errorEmitter.emit('permission-error', permissionError);
            }
        } else if (setHasSave) {
            setHasSave(false);
        }
    }, [user, firestore, setHasSave]);
    
    const loadCheckpoint = useCallback(async (): Promise<Checkpoint | null> => {
        if (!user || !firestore || user.isAnonymous) {
            return null;
        }
        const checkpointRef = doc(firestore, 'users', user.uid, 'checkpoints', 'main');
        try {
            const docSnap = await getDoc(checkpointRef);
            if (docSnap.exists()) {
                // Here we can add migration logic for old save formats if needed
                return docSnap.data() as Checkpoint;
            }
            return null;
        } catch (serverError) {
             const permissionError = new FirestorePermissionError({
                path: checkpointRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
            return null;
        }
    }, [user, firestore]);

    // This effect is responsible for the initial check for a save file.
    useEffect(() => {
        if (!setIsCheckingSave || !setHasSave) return;
        
        if (!user || user.isAnonymous) {
            setHasSave(false);
            setIsCheckingSave(false);
            return;
        }

        setIsCheckingSave(true);
        const checkpointRef = doc(firestore, 'users', user.uid, 'checkpoints', 'main');
        getDoc(checkpointRef).then(docSnap => {
            setHasSave(docSnap.exists());
        }).catch(error => {
            console.error("Error checking for save file:", error);
            setHasSave(false);
        }).finally(() => {
            setIsCheckingSave(false);
        });

    }, [user, firestore, setHasSave, setIsCheckingSave]);


    return {
        saveCheckpoint,
        deleteCheckpoint,
        loadCheckpoint,
    };
};
