import admin from 'firebase-admin';
import { setCorsHeaders } from '../../../lib/utils/cors';
import { getUserIdFromRequest, getFirestoreInstance } from '../../../lib/utils/serverFirebaseUtils';

const firestore = getFirestoreInstance();

function errorResponse(message, statusCode) {
  const body = JSON.stringify({ success: false, error: message });
  const response = new Response(body, {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
  return setCorsHeaders(response);
}

export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  return setCorsHeaders(response);
}

export async function POST(request) {
  try {
    const userId = await getUserIdFromRequest(request);
    console.log("User ID extracted from token:", userId);
    
    const data = await request.json();
    let { email, username, emailVerified, provider } = data;
    
    if (!email || typeof emailVerified !== 'boolean') {
      return errorResponse("Missing required fields", 400);
    }
    
    email = email.toLowerCase();
    
    const existingUserDoc = await firestore.doc(`users/${userId}`).get();
    if (existingUserDoc.exists) {
      return errorResponse("User already exists", 400);
    }
    
    const emailQuerySnapshot = await firestore.collection('users')
      .where('email', '==', email)
      .get();
    if (!emailQuerySnapshot.empty) {
      return errorResponse("This email is already registered. Please sign in instead.", 400);
    }
    
    if (username) {
      username = username.trim();
      const publicUsersRef = firestore.collection("publicUsers");
      const usernameSnapshot = await publicUsersRef.where("username", "==", username).get();
      if (!usernameSnapshot.empty) {
        return errorResponse("Username is already taken", 400);
      }
    }
    
    await firestore.doc(`users/${userId}`).set({
      uid: userId,
      email,
      username: username || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      emailVerified,
      ...(provider ? { provider } : {})
    });
    
    await firestore.doc(`publicUsers/${userId}`).set({
      uid: userId,
      username: username || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
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