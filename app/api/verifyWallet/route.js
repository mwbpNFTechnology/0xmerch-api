import { ethers } from 'ethers';

// Helper: set CORS headers (if needed)
function setCorsHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  return setCorsHeaders(response);
}

export async function POST(request) {
  try {
    const { address, nonce, signature, message } = await request.json();

    // Validate required fields
    if (!address || !nonce || !signature || !message) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
    }

    // Reconstruct the expected message
    const expectedMessage = `Welcome to 0xMerch!\n\nNonce: ${nonce}\n\nPlease sign this message to verify your wallet ownership.`;

    // Verify that the signed message matches the expected message
    if (message !== expectedMessage) {
      return new Response(JSON.stringify({ error: 'Message does not match' }), { status: 400 });
    }

    // Recover the address from the signature
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return new Response(JSON.stringify({ error: 'Signature verification failed' }), { status: 400 });
    }

    // At this point, the wallet is verified.
    // You can now save the verified wallet to your database if needed.
    
    const response = new Response(JSON.stringify({ success: true, message: 'Wallet verified successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error verifying wallet:', error);
    const response = new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    return setCorsHeaders(response);
  }
}