'use client';

import { useState, useEffect } from 'react';
import type {
  CollectionReference,
  Query,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';
import { onSnapshot, collection, getFirestore } from 'firebase/firestore'; // Corrected: No direct import needed, but good practice.
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

interface UseCollectionOptions<T> {
  initialData?: T[];
}

export function useCollection<T extends DocumentData>(
  query: Query<T> | CollectionReference<T> | null,
  options: UseCollectionOptions<T> = {}
) {
  const [data, setData] = useState<T[] | null>(options.initialData || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!query) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const docs = snapshot.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id } as T)
        );
        setData(docs);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
        // Corrected & Hardened: Get the path from the underlying _query property.
        // This provides the correct path for both CollectionReferences and Queries.
        const path = (query as any)._query.path.segments.join('/');
        const permissionError = new FirestorePermissionError({
            path: path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, isLoading, error };
}
