import admin from 'firebase-admin';
import { Contract } from 'ethers';
import { setCorsHeaders } from '../../../../lib/utils/cors';
import { 
  getFirestoreInstance, 
  getStorageBucket, 
  getUserIdFromRequest 
} from '../../../../lib/utils/serverFirebaseUtils';
import { 
  getProviderFromInteractWithContract
} from '../../../../lib/utils/blockchainNetworkUtilis';
import { 
  getMerchSmertContract, 
  MERCH_ABI, 
  SupportedNetwork 
} from '../../../../config/contractConfig';

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
    const productID = formData.get('productID');
    const title = formData.get('title');
    const description = formData.get('description');
    const ethPrice = formData.get('ethPrice');
    const discount = formData.get('discount');
    const totalStock = formData.get('totalStock');
    const maxQtyPerUser = formData.get('maxQtyPerUser');
    
    // Extract additional fields.
    const walletAddress = formData.get('walletAddress');
    const erc721NFTContractAddress = formData.get('erc721NFTContractAddress');
    
    // Get network from the URL query parameter instead of FormData.
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network');

    // Validate required fields.
    if (
      !productID ||
      !title ||
      !description ||
      ethPrice == null ||
      discount == null ||
      totalStock == null ||
      maxQtyPerUser == null ||
      !walletAddress ||
      !erc721NFTContractAddress ||
      !network
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

    // Check if the wallet document exists at users/{userId}/wallets/{walletAddress}
    const walletDocRef = firestore
      .collection('users')
      .doc(userId)
      .collection('wallets')
      .doc(walletAddress.toString().trim());
    const walletDoc = await walletDocRef.get();
    if (!walletDoc.exists) {
      return errorResponse("Wallet address not found", 400);
    }

    // --- Blockchain Check: Verify that the wallet owns the provided ERC721 NFT contract ---

    // Normalize network to lowercase and check supported networks.
    const normalizedNetwork = network.toString().toLowerCase();
    if (!Object.values(SupportedNetwork).includes(normalizedNetwork)) {
      return errorResponse(`Unsupported network: ${network}`, 400);
    }

    // Get provider for contract interactions.
    const provider = getProviderFromInteractWithContract(request);

    // Retrieve the merchSmert contract configuration.
    const { contractAddress: merchContractAddress } = getMerchSmertContract(normalizedNetwork);

    // Instantiate the contract with the configured ABI.
    const contract = new Contract(merchContractAddress, MERCH_ABI, provider);

    // Call getContractInfosByOwner with the walletAddress.
    const rawInfos = await contract.getContractInfosByOwner(walletAddress);
    // rawInfos is assumed to be an array of tuples like:
    // [ [contractName, contractAddress, contractOwner, royalties, uuid0xMERCH], ... ]
    const matchingContract = rawInfos.find(info =>
      info[1].toString().toLowerCase() === erc721NFTContractAddress.toString().toLowerCase()
    );

    if (!matchingContract) {
      return errorResponse("The provided wallet does not own the specified ERC721 NFT contract", 400);
    }

    // --- End of blockchain ownership check ---

    // Extract multiple image files (key "images").
    const imageFiles = formData.getAll('images');
    // Ensure at least one image file was provided.
    if (!imageFiles || imageFiles.length === 0) {
      return errorResponse("No image file provided", 400);
    }

    // Use the productID provided in the request.
    const finalProductID = productID.toString().trim();

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
      // Save images under: blockProduct/{userId}/{finalProductID}/{uniqueFileName}
      const fileUpload = bucket.file(`blockProduct/${userId}/${finalProductID}/${uniqueFileName}`);

      await fileUpload.save(fileBuffer, {
        metadata: { contentType: fileMimeType },
      });

      // Make the file public and get its URL.
      await fileUpload.makePublic();
      const imageUrl = fileUpload.publicUrl();
      imageUrls.push(imageUrl);
    }

    // Create a new product document in Firestore with the productID from the request.
    const newProductRef = firestore.collection('productsBlockchain').doc(finalProductID);
    const productData = {
      productID: finalProductID,
      title: title.toString().trim(),
      description: description.toString().trim(),
      ethPrice: ethPriceNum,
      discount: discountNum,
      totalStock: totalStockNum,
      maxQtyPerUser: maxQtyPerUserNum,
      walletAddress: walletAddress.toString().trim(),
      erc721NFTContractAddress: erc721NFTContractAddress.toString().trim(),
      imageUrls, // Attach the array of image URLs.
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      uid: userId
    };

    await newProductRef.set(productData);

    const responseBody = { success: true, productId: finalProductID, imageUrls };
    const response = new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    return setCorsHeaders(response);
  } catch (err) {
    console.error("Error processing product upload:", err);
    return errorResponse(err.message || "Server error", 500);
  }
}