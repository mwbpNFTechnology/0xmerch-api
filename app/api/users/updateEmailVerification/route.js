import admin from 'firebase-admin';
import { setCorsHeaders } from '../../../lib/utils/cors';
import { getUserIdFromRequest, getFirestoreInstance } from '../../../lib/utils/serverFirebaseUtils';

const firestore = getFirestoreInstance();

/**
 * Returns an error response with CORS headers.
 *
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code.
 * @returns {Response} - The error response.
 */
function errorResponse(message, statusCode) {
  const body = JSON.stringify({ success: false, error: message });
  const response = new Response(body, {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
  return setCorsHeaders(response);
}

/**
 * Handles preflight OPTIONS requests.
 *
 * @returns {Promise<Response>} - A response with the proper CORS headers.
 */
export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  return setCorsHeaders(response);
}

/**
 * POST handler to update the user's email verification status.
 *
 * This route:
 * 1. Extracts the user ID from the auth token.
 * 2. Parses the request body to get the emailVerified boolean.
 * 3. Updates the user document with emailVerified and, if true, sets emailVerifiedAt using the server timestamp.
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<Response>} - A response indicating success or error.
 */
export async function POST(request) {
  try {
    // Extract the user ID from the auth token.
    const userId = await getUserIdFromRequest(request);

    // Parse the request body.
    const { emailVerified } = await request.json();
    if (typeof emailVerified !== 'boolean') {
      return errorResponse("Invalid or missing 'emailVerified' value", 400);
    }

    // Set the emailVerifiedAt timestamp if verified; otherwise, null.
    const emailVerifiedAt = emailVerified ? admin.firestore.FieldValue.serverTimestamp() : null;

    // Update the user's document in the "users" collection.
    await firestore.doc(`users/${userId}`).set({
      emailVerified,
      emailVerifiedAt,
    }, { merge: true });

    // Return a successful response.
    const response = new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    return setCorsHeaders(response);
  } catch (error) {
    console.error("Error updating email verification status:", error);
    return errorResponse("Server error", 500);
  }
}