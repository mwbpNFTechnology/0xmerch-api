import admin from 'firebase-admin';
import { setCorsHeaders } from '../../../../lib/utils/cors';
import { getFirestoreInstance, getStorageBucket, getUserIdFromRequest } from '../../../../lib/utils/serverFirebaseUtils';

const firestore = getFirestoreInstance();

function errorResponse(message, statusCode) {
  const body = JSON.stringify({ error: message });
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
    // Retrieve the authenticated user's ID.
    const userId = await getUserIdFromRequest(request);

    // Parse the multipart form data.
    const formData = await request.formData();

    // Extract text fields.
    const title = formData.get('title');
    const description = formData.get('description');
    const ethPrice = formData.get('ethPrice');
    const discount = formData.get('discount');
    const totalStock = formData.get('totalStock');
    const maxQtyPerUser = formData.get('maxQtyPerUser');

    // Extract multiple image files (key "images").
    const imageFiles = formData.getAll('images');

    // Validate required fields.
    if (
      !title ||
      !description ||
      ethPrice == null ||
      discount == null ||
      totalStock == null ||
      maxQtyPerUser == null
    ) {
      return errorResponse("Missing required fields", 400);
    }

    // Convert numeric fields.
    const ethPriceNum = Number(ethPrice);
    const discountNum = Number(discount);
    const totalStockNum = Number(totalStock);
    const maxQtyPerUserNum = Number(maxQtyPerUser);
    if (
      isNaN(ethPriceNum) ||
      isNaN(discountNum) ||
      isNaN(totalStockNum) ||
      isNaN(maxQtyPerUserNum)
    ) {
      return errorResponse("Invalid numeric values", 400);
    }

    // Ensure at least one image file was provided.
    if (!imageFiles || imageFiles.length === 0) {
      return errorResponse("No image file provided", 400);
    }

    // Generate a sequential product ID (document ID/product name).
    const productsSnapshot = await firestore.collection('productsBlockchain').get();
    const productCount = productsSnapshot.size;
    const productNumber = String(productCount + 1);
    const productID = `blockProduct-${productNumber}`;

    // Retrieve the storage bucket using our helper.
    const bucket = getStorageBucket();

    // Loop over each image file, upload it, and collect its public URL.
    const imageUrls = [];
    for (const imageFile of imageFiles) {
      if (typeof imageFile.arrayBuffer !== 'function') continue;
      const arrayBuffer = await imageFile.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      const fileName = imageFile.name;
      const fileMimeType = imageFile.type;
      const uniqueFileName = `${Date.now()}-${fileName}`;
      // Save images under: blockProduct/{userId}/{productID}/{uniqueFileName}
      const fileUpload = bucket.file(`blockProduct/${userId}/${productID}/${uniqueFileName}`);

      await fileUpload.save(fileBuffer, {
        metadata: { contentType: fileMimeType },
      });

      // Make the file public and get its URL.
      await fileUpload.makePublic();
      const imageUrl = fileUpload.publicUrl();
      imageUrls.push(imageUrl);
    }

    // Create a new product document in Firestore with the productID as its document ID.
    const newProductRef = firestore.collection('productsBlockchain').doc(productID);
    const productData = {
      productID, // Also used as product name.
      title: title.toString().trim(),
      description: description.toString().trim(),
      ethPrice: ethPriceNum,
      discount: discountNum,
      totalStock: totalStockNum,
      maxQtyPerUser: maxQtyPerUserNum,
      imageUrls, // Attach the array of image URLs.
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: userId
    };

    await newProductRef.set(productData);

    const responseBody = { success: true, productId: productID, imageUrls };
    const response = new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    return setCorsHeaders(response);
  } catch (err) {
    console.error("Error processing product upload:", err);
    // Return the error message as JSON. For example, if authentication fails,
    // err.message might be "getUserIdFromRequest is not defined".
    return errorResponse(err.message || "Server error", 500);
  }
}