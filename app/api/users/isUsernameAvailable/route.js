// app/api/users/isUsernameAvailable/route.js


import { setCorsHeaders } from '../../../lib/utils/cors';
import { getFirestoreInstance } from '../../../lib/utils/serverFirebaseUtils';

// Retrieve the Firestore instance from our shared Firebase Admin utility.
const firestore = getFirestoreInstance();

/**
 * Handles preflight OPTIONS requests.
 * Browsers send these requests as part of CORS to verify that the actual request is allowed.
 * This function returns a 204 No Content response with the necessary CORS headers.
 *
 * @returns {Promise<Response>} - A response with status 204 and CORS headers.
 */
export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  return setCorsHeaders(response);
}

/**
 * Handles GET requests to check if a username is available in the `publicUsers` collection.
 * Expects a query parameter `username` in the URL.
 *
 * Example URL:
 *   https://0xmerch-api.vercel.app/api/isUsernameAvailable?username=exampleUser
 *
 * JSON Response:
 *   If available: { "available": true }
 *   If taken:    { "available": false }
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<Response>} - A JSON response indicating username availability.
 */
export async function GET(request) {
  try {
    // Extract the 'username' query parameter from the request URL.
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return setCorsHeaders(new Response(JSON.stringify({ error: 'Missing username parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }));
    }
    
    // Reference the "publicUsers" collection.
    const publicUsersRef = firestore.collection('publicUsers');
    
    // Create a query to find any document with a matching 'username'.
    const snapshot = await publicUsersRef.where('username', '==', username).get();
    
    // If the query snapshot is empty, no user with that username exists.
    const available = snapshot.empty;
    
    // Return a JSON response with the availability status.
    const response = new Response(JSON.stringify({ available }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error checking username availability:', error);
    return setCorsHeaders(new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }));
  }
}