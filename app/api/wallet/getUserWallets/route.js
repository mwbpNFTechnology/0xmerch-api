// app/api/wallet/getUserWallets/route.js

// Import our global CORS helper.
import { setCorsHeaders } from '../../../lib/utils/cors';
// Import our server-side Firebase utilities.
import { getUserIdFromRequest, getFirestoreInstance } from '../../../lib/utils/serverFirebaseUtils';
// Import Firestore functions.
import { collection, getDocs } from 'firebase/firestore';

// Retrieve the Firestore instance.
const firestore = getFirestoreInstance();

/**
 * Handles preflight OPTIONS requests.
 *
 * @returns {Promise<Response>} - A response with status 204 and CORS headers.
 */
export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  return setCorsHeaders(response);
}

/**
 * GET endpoint to retrieve a user's wallets.
 * This function:
 * 1. Extracts the user's UID by verifying the Firebase ID token from the request.
 * 2. Fetches the wallets from Firestore under the user's wallets subcollection.
 * 3. Returns the list of wallets as JSON.
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<Response>} - A JSON response containing the wallets or an error message.
 */
export async function GET(request) {
  try {
    // Extract the user's UID from the Firebase ID token.
    const userId = await getUserIdFromRequest(request);

    // Reference the wallets subcollection.
    const walletsRef = collection(firestore, `users/${userId}/wallets`);
    const walletsSnapshot = await getDocs(walletsRef);

    // Map over the documents to return wallet data.
    const wallets = walletsSnapshot.docs.map(doc => ({
      ...doc.data(),
      walletAddress: doc.id,
    }));

    // Return the wallet data in the response.
    const response = new Response(JSON.stringify(wallets), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error fetching user wallets:', error);
    const response = new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
    return setCorsHeaders(response);
  }
}