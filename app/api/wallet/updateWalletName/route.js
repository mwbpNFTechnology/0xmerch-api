// app/api/wallet/updateWalletName/route.js

// Import the global CORS helper.
import { setCorsHeaders } from '../../../lib/utils/cors';
// Import our server-side Firebase utilities.
import { getUserIdFromRequest, getFirestoreInstance } from '../../../lib/utils/serverFirebaseUtils';
// Import the Firebase Admin SDK.
import admin from 'firebase-admin';

// Retrieve the Firestore instance.
const firestore = getFirestoreInstance();

/**
 * Helper function to create a standardized error response with JSON content.
 * The response contains an object with an error message.
 *
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code for the error response.
 * @returns {Response} - A Response object with error details and CORS headers.
 */
function errorResponse(message, statusCode) {
  const body = JSON.stringify({ error: message });
  const response = new Response(body, {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
  return setCorsHeaders(response);
}

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
 * POST endpoint to update the name of a wallet.
 * Expects a JSON body with `walletAddress` and `newName`.
 *
 * Process:
 * 1. Extracts the user's UID by verifying the Firebase ID token from the request.
 * 2. Parses the request body to retrieve the walletAddress and newName.
 * 3. Validates the required parameters.
 * 4. Updates the wallet document in Firestore with the new wallet name and sets an updated timestamp.
 * 5. Returns a successful JSON response if the update completes.
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<Response>} - A JSON response indicating success or an error.
 */
export async function POST(request) {
  try {
    // Extract the user's UID by verifying the Firebase ID token.
    const userId = await getUserIdFromRequest(request);
    
    // Parse the request body.
    const { walletAddress, newName } = await request.json();
    
    // Validate the required parameters.
    if (!userId || !walletAddress || !newName || !newName.trim()) {
      return errorResponse("Missing required parameters for wallet name update", 400);
    }
    
    // Reference the wallet document using the Admin SDK.
    const walletRef = firestore.doc(`users/${userId}/wallets/${walletAddress}`);
    
    // Update the wallet document with the new name and an updated timestamp.
    await walletRef.update({
      walletName: newName.trim(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log(`Wallet name updated successfully for ${walletAddress}`);
    
    // Return a successful JSON response.
    const response = new Response(
      JSON.stringify({ message: "Wallet name updated successfully" }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    return setCorsHeaders(response);
  } catch (error) {
    console.error("Error updating wallet name:", error);
    return errorResponse("Failed to update wallet name. Please try again.", 500);
  }
}