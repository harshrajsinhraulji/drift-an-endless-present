
'use client';

import type { DocumentReference, SetOptions, Firestore } from 'firebase/firestore';
import { setDoc } from 'firebase/firestore';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/**
 * A non-blocking version of setDoc that optimistically updates and handles
 * permission errors centrally. It does not `await` the Firestore operation,
 * allowing the UI to remain responsive. Errors are caught and emitted
 * for a central listener to handle.
 *
 * @param docRef - The DocumentReference to write to.
 * @param data - The data to write.
 * @param options - SetOptions for the write operation (e.g., { merge: true }).
 */
export function setDocumentNonBlocking(
  docRef: DocumentReference,
  data: any,
  options?: SetOptions
) {
  const operation = options && 'merge' in options ? 'update' : 'create';
  
  const promise = options ? setDoc(docRef, data, options) : setDoc(docRef, data);

  promise.catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: operation,
        requestResourceData: data,
      });

      // Emit the error for a central listener to handle.
      // This is crucial for developer experience, as it surfaces rich errors.
      errorEmitter.emit('permission-error', permissionError);
    });
}
