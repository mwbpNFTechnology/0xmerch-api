import admin from 'firebase-admin';
import { setCorsHeaders } from '../../../lib/utils/cors';
import { getUserIdFromRequest, getFirestoreInstance } from '../../../lib/utils/serverFirebaseUtils';

// Retrieve the Firestore instance from our shared Firebase Admin utility.
const firestore = getFirestoreInstance();

/**
 * Helper function to create a standardized error response with JSON content.
 * The response contains an object with success: false and an error message.
 *
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code for the error response.
 * @returns {Response} - A Response object with error details and CORS headers.
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
 * Returns a 204 No Content response with the necessary CORS headers.
 *
 * @returns {Promise<Response>} - A response with status 204 and CORS headers.
 */
export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  return setCorsHeaders(response);
}

/**
 * Handles POST requests to save a new user to the database.
 * This function:
 * 1. Uses getUserIdFromRequest() to extract and verify the Firebase ID token,
 *    obtaining the user's UID.
 * 2. Parses the request body for user data: email, username (optional), emailVerified, and provider (optional).
 * 3. Checks if a user document already exists for this UID.
 * 4. Queries the "users" collection to ensure the email is not already in use.
 * 5. If a username is provided, checks if it is available in the `publicUsers` collection.
 * 6. Saves private user data to the "users" collection.
 * 7. Saves public user data to the "publicUsers" collection.
 * 8. Returns a JSON response indicating success.
 *
 * Expected request body (JSON):
 * {
 *   "email": "user@example.com",
 *   "username": "desiredUsername",  // optional
 *   "emailVerified": true,
 *   "provider": "google"            // optional
 * }
 *
 * The user ID is derived from the Firebase ID token.
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<Response>} - A JSON response indicating success or error.
 */
export async function POST(request) {
  try {
    // Extract the user's UID from the Firebase ID token in the Authorization header.
    const userId = await getUserIdFromRequest(request);
    console.log("User ID extracted from token:", userId);
    
    // Parse the request body for user data.
    const data = await request.json();
    let { email, username, emailVerified, provider } = data;
    
    // Validate required fields.
    if (!email || typeof emailVerified !== 'boolean') {
      return errorResponse("Missing required fields", 400);
    }
    
    // Normalize email to lowercase for consistent comparison.
    email = email.toLowerCase();
    
    // Check if a user document already exists for this userId.
    const existingUserDoc = await firestore.doc(`users/${userId}`).get();
    if (existingUserDoc.exists) {
      return errorResponse("User already exists", 400);
    }
    
    // Check if the email is already used by another user.
    const emailQuerySnapshot = await firestore.collection('users')
      .where('email', '==', email)
      .get();
    console.log(`Email query snapshot size for ${email}: `, emailQuerySnapshot.size);
    if (!emailQuerySnapshot.empty) {
      return errorResponse("This email is already registered. Please sign in instead.", 400);
    }
    
    // If a username is provided, check if it is available.
    if (username) {
      // Normalize username if needed (e.g., trim whitespace).
      username = username.trim();
      const publicUsersRef = firestore.collection("publicUsers");
      const usernameSnapshot = await publicUsersRef.where("username", "==", username).get();
      if (!usernameSnapshot.empty) {
        return errorResponse("Username is already taken", 400);
      }
    }
    
    // Save private user data to the "users" collection.
    await firestore.doc(`users/${userId}`).set({
      uid: userId,
      email: email,
      username: username || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      emailVerified: emailVerified,
      ...(provider ? { provider } : {})
    });
    
    // Save public user data to the "publicUsers" collection.
    await firestore.doc(`publicUsers/${userId}`).set({
      uid: userId,
      username: username || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Return a successful JSON response.
    const response = new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    return setCorsHeaders(response);
  } catch (error) {
    console.error("Error saving user to database:", error);
    return errorResponse("Server error", 500);
  }
}