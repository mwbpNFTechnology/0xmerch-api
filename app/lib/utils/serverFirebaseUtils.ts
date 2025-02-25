// app/lib/utils/serverFirebaseUtils.ts
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if it hasn't been initialized yet.
if (!process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error('FIREBASE_PRIVATE_KEY is not defined');
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

/**
 * Extracts the Firebase ID token from the request's Authorization header,
 * verifies it using Firebase Admin, and returns the user's UID.
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<string>} - The user ID (UID) from the verified token.
 * @throws Error if no token is provided or token verification fails.
 */
export async function getUserIdFromRequest(request: Request): Promise<string> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('No Authorization header provided');
  }
  // Expect the header in the format: "Bearer <token>"
  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    throw new Error('Invalid Authorization header');
  }
  const decodedToken = await admin.auth().verifyIdToken(token);
  return decodedToken.uid;
}