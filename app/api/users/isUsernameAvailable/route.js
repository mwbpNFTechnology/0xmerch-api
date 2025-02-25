import admin from 'firebase-admin';
import { setCorsHeaders } from '../../../lib/utils/cors'; // Adjust path as needed

// Initialize Firebase Admin SDK if not already initialized.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID, // Your Firebase project ID.
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL, // Your service account email.
      // Use the private key from your environment variables. Replace escaped newlines with actual newlines if necessary.
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const firestore = admin.firestore();

/**
 * Handles GET requests to check if a username is available in the `publicUsers` collection.
 * Expects a query parameter `username`.
 * Returns a JSON response with { available: true } if the username is available,
 * or { available: false } if it is already taken.
 *
 * @returns {Promise<Response>} - A JSON response with the availability result.
 */
export async function GET(request) {
  try {
    // Parse the query parameter from the URL.
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return new Response(JSON.stringify({ error: 'Missing username parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Reference the 'publicUsers' collection.
    const publicUsersRef = firestore.collection('publicUsers');
    
    // Query for any document with a matching 'username'.
    const snapshot = await publicUsersRef.where('username', '==', username).get();
    
    // If the query returns empty, no user with that username exists.
    const available = snapshot.empty;
    
    // Create a response with the availability result.
    const response = new Response(JSON.stringify({ available }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error checking username availability:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}