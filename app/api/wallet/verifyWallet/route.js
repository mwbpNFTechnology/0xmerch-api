// app/api/wallet/verifyWallet/route.js

// Import the verifyMessage function from ethers, which is used to recover the signing address,
// and import the Firebase Admin SDK for secure server-side operations.
import { verifyMessage } from 'ethers';
import admin from 'firebase-admin';
// Import the global CORS helper function from our shared utility file.
import { setCorsHeaders } from '@/lib/utils/cors';

// Initialize Firebase Admin SDK if it hasn't been initialized yet.
// This initialization uses credentials from environment variables.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID, // Your Firebase project ID.
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL, // Your service account email.
      // Use the private key from your environment variables.
      // If the key is stored as a single-line string with escaped newline characters,
      // this converts them to actual newlines.
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

// Retrieve the Firestore instance from the Firebase Admin SDK.
const firestore = admin.firestore();

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
 * Browsers send these requests as part of CORS to verify that the actual request is allowed.
 * This function returns a 204 No Content response with the appropriate CORS headers.
 *
 * @returns {Promise<Response>} - A response with status 204.
 */
export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  return setCorsHeaders(response);
}

/**
 * Main POST handler for wallet verification and saving.
 * This function:
 * 1. Retrieves and verifies the Firebase ID token from the Authorization header.
 * 2. Parses the request body for wallet-related fields: address, nonce, signature, message, and networkType.
 * 3. Constructs the expected message and compares it with the provided message.
 * 4. Uses ethers' verifyMessage to recover the address from the signature and compares it to the provided address.
 * 5. Determines a new wallet name based on the user's existing wallets in Firestore.
 * 6. Saves the verified wallet data to Firestore under the user's wallets subcollection.
 * 7. Returns a successful JSON response with { verify: true, walletName }.
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<Response>} - A response with the result of the verification.
 */
export async function POST(request) {
  try {
    // Retrieve the Authorization header from the request.
    // This header should contain the Firebase ID token.
    const authHeader = request.headers.get('Authorization');
    console.log('Authorization header:', authHeader);
    if (!authHeader) {
      return errorResponse('No Authorization header provided', 401);
    }
    // Expect the header to be in the format "Bearer <token>".
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return errorResponse('Invalid Authorization header', 401);
    }
    
    // Verify the token using Firebase Admin to obtain the user's UID.
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
      console.log('Decoded token:', decodedToken);
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      return errorResponse('Invalid token', 401);
    }
    const userId = decodedToken.uid;
    
    // Parse the request body. Expected fields are: address, nonce, signature, message, and networkType.
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