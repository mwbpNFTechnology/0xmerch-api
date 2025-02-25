import { verifyMessage } from 'ethers';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // If your key is stored as single line with escaped newlines, use replace.
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const firestore = admin.firestore();

// Helper function to set CORS headers.
function setCorsHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Helper function to create error responses with JSON.
function errorResponse(message, statusCode) {
  const body = JSON.stringify({ verify: false, error: message });
  const response = new Response(body, {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
  return setCorsHeaders(response);
}

// Handle preflight OPTIONS requests.
export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  return setCorsHeaders(response);
}

// Handle POST requests for wallet verification and saving.
export async function POST(request) {
  try {
    // (Optional) You can still log the Authorization header if provided.
    const authHeader = request.headers.get('Authorization');
    console.log('Authorization header:', authHeader);
    
    // Instead of extracting userId from the token, we accept it in the request body.
    const { userId, address, nonce, signature, message, networkType } = await request.json();

    if (!userId) {
      return errorResponse('Missing userId in request body', 400);
    }

    // Construct the expected message.
    const expectedMessage = `Welcome to 0xMerch!\n\nNonce: ${nonce}\n\nPlease sign this message to verify your wallet ownership.`;
    if (message !== expectedMessage) {
      return errorResponse('Message does not match', 400);
    }

    // Verify the signature.
    const recoveredAddress = verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return errorResponse('Signature verification failed', 400);
    }

    // Determine the wallet name based on how many wallets the user already has.
    const walletsRef = firestore.collection(`users/${userId}/wallets`);
    const walletsSnapshot = await walletsRef.get();
    const walletCount = walletsSnapshot.size;
    const walletName = `wallet${walletCount + 1}`;

    // Save the verified wallet in Firestore.
    const walletRef = firestore.doc(`users/${userId}/wallets/${address}`);
    await walletRef.set({
      walletAddress: address,
      networkType,
      walletName,
      walletVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Verification successful: return JSON with verify: true and the walletName.
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