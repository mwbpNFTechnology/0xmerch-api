// app/api/nfts/saveCollectionForOwner/route.js

// Import the global CORS helper.
import { setCorsHeaders } from '../../../lib/utils/cors';
// Import our server-side Firebase utilities for token extraction and Firestore instance.
import { getUserIdFromRequest, getFirestoreInstance } from '../../../lib/utils/serverFirebaseUtils';
// Import the Firebase Admin SDK.
import admin from 'firebase-admin';

// Retrieve the Firestore instance.
// const firestore = getFirestoreInstance();

/**
 * Helper function to create a standardized error response with JSON content.
 *
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code for the error response.
 * @returns {Response} - A Response object with error details and CORS headers.
 */
function errorResponse(message, statusCode) {
  const body = JSON.stringify({ markAsCreator: false, error: message });
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
 * POST endpoint for marking a collection as created by the user.
 * Expects a JSON body with:
 *   - ownerAddress (string)
 *   - nftContractAddress (string)
 *   - royalties (number)
 *   - imageURL (string)
 *   - network (string)
 *
 * The function saves the provided data in three locations:
 *   1. Under the user's assignCollections subcollection:
 *      users/{userId}/assignCollections/{nftContractAddress}
 *   2. In the nftCollections collection:
 *      nftCollections/{nftContractAddress} (with an additional userID field)
 *   3. Updates the publicUsers document:
 *      publicUsers/{userId} by appending the collection data to the nftCollections array.
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<Response>} - A JSON response indicating success or an error message.
 */
export async function POST(request) {
  try {
    // Verify and extract the user's UID.
    const userId = await getUserIdFromRequest(request);

    // Parse the request body.
    const { ownerAddress, nftContractAddress, royalties, imageURL, network } = await request.json();

    // Validate required parameters.
    if (!ownerAddress || !nftContractAddress || royalties == null || !network) {
      return errorResponse("Missing required parameters", 400);
    }

    // 1. Save under the user's assignCollections subcollection.
    // const assignCollectionsRef = firestore.doc(`users/${userId}/assignCollections/${nftContractAddress}`);
    // await assignCollectionsRef.set({
    //   ownerAddress,
    //   nftContractAddress,
    //   network,
    //   royalties,
    //   imageURL,
    // });

    // 2. Save in the global nftCollections collection (include the userID).
    const nftCollectionsRef = admin.firestore.doc(`nftCollections/${nftContractAddress}`);
    await nftCollectionsRef.set({
      ownerAddress,
      nftContractAddress,
      network,
      royalties,
      userID: userId,
      imageURL,
    });

    // 3. Update the publicUsers document by appending this collection info to the nftCollections array field.
    // const publicUserRef = firestore.doc(`publicUsers/${userId}`);
    // await publicUserRef.update({
    //   nftCollections: admin.firestore.FieldValue.arrayUnion({
    //     ownerAddress,
    //     nftContractAddress,
    //     network,
    //     royalties,
    //     imageURL,
    //   })
    // });

    // Return a successful JSON response.
    const response = new Response(
      JSON.stringify({ markAsCreator: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    return setCorsHeaders(response);
  } catch (error) {
    console.error("Error in markAsCreator:", error);
    return errorResponse("Server error", 500);
  }
}