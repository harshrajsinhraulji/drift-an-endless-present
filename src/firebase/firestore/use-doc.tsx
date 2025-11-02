'use client';

import { useState, useEffect } from 'react';
import type {
  DocumentReference,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

interface UseDocOptions<T> {
  initialData?: T;
}

export function useDoc<T extends DocumentData>(
  ref: DocumentReference<T> | null,
  options: UseDocOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(options.initialData || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ ...snapshot.data(), id: snapshot.id } as T);
        } else {
          setData(null);
        }
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
        const permissionError = new FirestorePermissionError({
            path: ref.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [ref?.path]);

  return { data, isLoading, error };
}
