// app/api/users/updateLastLogin/route.js

import admin from 'firebase-admin';
import { setCorsHeaders } from '../../../lib/utils/cors';
import { getUserIdFromRequest, getFirestoreInstance } from '../../../lib/utils/serverFirebaseUtils';

const firestore = getFirestoreInstance();

/**
 * Helper function to create an error response with CORS headers.
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
 * Handles OPTIONS preflight requests.
 *
 * @returns {Promise<Response>} - The preflight response with CORS headers.
 */
export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  return setCorsHeaders(response);
}

/**
 * POST handler to update the user's last login timestamp.
 *
 * This route:
 * 1. Extracts the user's ID from the auth token.
 * 2. Updates the `lastLoginAt` field on both the "users" and "publicUsers" documents.
 * 3. Returns a JSON response indicating success.
 *
 * @param {Request} request - The incoming request.
 * @returns {Promise<Response>} - The response with the update result.
 */
export async function POST(request) {
  try {
    // Extract the user ID from the provided auth token.
    const userId = await getUserIdFromRequest(request);
    
    // Get the server timestamp from Firebase Admin.
    const lastLoginAt = admin.firestore.FieldValue.serverTimestamp();

    // Update the private user document.
    const userRef = firestore.doc(`users/${userId}`);
    await userRef.set({ lastLoginAt }, { merge: true });

    // Update the public user document.
    const publicUserRef = firestore.doc(`publicUsers/${userId}`);
    await publicUserRef.set({ lastLoginAt }, { merge: true });

    // Return a successful response.
    const response = new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    return setCorsHeaders(response);
  } catch (error) {
    console.error("Error updating last login:", error);
    return errorResponse("Server error", 500);
  }
}