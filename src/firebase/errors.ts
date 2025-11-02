
'use client';

/**
 * Defines the context for a Firestore security rule denial.
 * This information is used to construct a rich, actionable error message for developers.
 */
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

/**
 * A custom error class for Firestore permission errors.
 * It formats the provided context into a detailed error message that helps developers
 * quickly identify and fix security rule issues.
 */
export class FirestorePermissionError extends Error {
  constructor(context: SecurityRuleContext) {
    const contextString = JSON.stringify(
      {
        auth: 'Please check the developer console for the full auth object from the original error.',
        ...context,
      },
      null,
      2
    );

    const message = `FirestoreError: Missing or insufficient permissions.
The following request was denied by Firestore Security Rules:
${contextString}

Troubleshooting Tips:
1. Check the Firestore Security Rules in your Firebase console.
2. Ensure the authenticated user (if any) has the required roles or ownership.
3. Verify that the request path and data match the constraints in your rules.
4. Look for the original 'FirebaseError: Missing or insufficient permissions' in the browser console for the full auth token details.`;

    super(message);
    this.name = 'FirestorePermissionError';

    // This is to make the error visible in the Next.js development overlay
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        throw new Error(this.message);
      }, 0);
    }
  }
}
