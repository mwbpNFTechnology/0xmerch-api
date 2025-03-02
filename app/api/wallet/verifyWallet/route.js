// app/api/wallet/verifyWallet/route.js

// Import the verifyMessage function from ethers to recover the signing address.
import { verifyMessage } from 'ethers';
// Import the global CORS helper function.
import { setCorsHeaders } from '../../../lib/utils/cors';
// Import our server-side Firebase utilities, including token extraction and Firestore instance.
import { getUserIdFromRequest, getFirestoreInstance } from '../../../lib/utils/serverFirebaseUtils';
// Import the Firebase Admin SDK.
import admin from 'firebase-admin';

// Retrieve the Firestore instance from our shared utility.
const firestore = getFirestoreInstance();

/**
 * Helper function to create a standardized error response with JSON content.
 * The response contains an object with verify: false and an error message.
 *
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code for the error response.
 * @returns {Response} - A Response object with error details and CORS headers.
 */
function errorResponse(message, statusCode) {
  const body = JSON.stringify({ verify: false, error: message });
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
 * Main POST handler for wallet verification and saving.
 * This function:
 * 1. Uses getUserIdFromRequest() to extract and verify the Firebase ID token,
 *    obtaining the user's UID.
 * 2. Parses the request body for wallet-related fields: address, nonce, signature, message, and networkType.
 * 3. Constructs the expected message and compares it with the provided message.
 * 4. Uses ethers' verifyMessage to recover the address from the signature and compares it to the provided address.
 * 5. Determines a new wallet name based on the user's existing wallets in Firestore.
 * 6. Saves the verified wallet data to Firestore under the user's wallets subcollection.
 * 7. Updates the corresponding publicUsers document by appending the wallet info to a wallets array.
 * 8. Returns a successful JSON response with { verify: true, walletName }.
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<Response>} - A response with the result of the verification.
 */
export async function POST(request) {
  try {
    // Extract the user's UID by verifying the Firebase ID token from the Authorization header.
    const userId = await getUserIdFromRequest(request);
    
    // Parse the request body. Expected fields: address, nonce, signature, message, and networkType.
    const { address, nonce, signature, message, networkType } = await request.json();
    
    // Construct the expected message that should have been signed by the user.
    const expectedMessage = `Welcome to 0xMerch!\n\nNonce: ${nonce}\n\nPlease sign this message to verify your wallet ownership.`;
    if (message !== expectedMessage) {
      return errorResponse('Message does not match', 400);
    }
    
    // Verify the signature using ethers' verifyMessage function.
    // This recovers the signing address from the message and signature.
    const recoveredAddress = verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return errorResponse('Signature verification failed', 400);
    }
    
    // Determine the wallet name based on the number of wallets the user already has.
    const walletsRef = firestore.collection(`users/${userId}/wallets`);
    const walletsSnapshot = await walletsRef.get();
    const walletCount = walletsSnapshot.size;
    const walletName = `wallet${walletCount + 1}`;
    
    // Save the verified wallet details in Firestore under the user's wallets subcollection.
    const walletRef = firestore.doc(`users/${userId}/wallets/${address}`);
    await walletRef.set({
      walletAddress: address,
      networkType,
      walletName,
      walletVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Update the publicUsers document by appending the wallet info to the wallets array field.
    // Use a client-generated timestamp since FieldValue.serverTimestamp() is not allowed inside an array.
    const publicUserRef = firestore.doc(`publicUsers/${userId}`);
    await publicUserRef.update({
      wallets: admin.firestore.FieldValue.arrayUnion({
        walletAddress: address,
        networkType,
        walletName,
        walletVerifiedAt: new Date().toISOString(),
      })
    });
    
    // Return a successful JSON response with verify: true and the wallet name.
    const response = new Response(
      JSON.stringify({ verify: true, walletName }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error verifying wallet:', error);
    return errorResponse('Server error', 500);
  }
}