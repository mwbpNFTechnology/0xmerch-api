import { Contract } from 'ethers';
import { setCorsHeaders } from '../../../../lib/utils/cors';
import { getProviderFromInteractWithContract } from '../../../../lib/utils/blockchainNetworkUtilis';
// (Optional) Uncomment if user identification is needed.
// import { getUserIdFromRequest } from '../../../../lib/utils/serverFirebaseUtils';

import { MERCH_NFT_COLLECTION_PRODUCTS_ABI, getMerchNFTCollectionProductSmertContract } from '../../../../config/contractConfig';
import { wgiToEth, getPrecent } from '../../../../lib/utils/numberUtils';
import { getFirestoreInstance } from '../../../../lib/utils/serverFirebaseUtils';

const firestore = getFirestoreInstance();

/**
 * A helper function that safely serializes objects with BigInt values.
 * @param {any} data - The data to serialize.
 * @returns {string} - The JSON string with BigInt values converted to strings.
 */
function safeStringify(data) {
  return JSON.stringify(data, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );
}

/**
 * Handles preflight OPTIONS requests.
 *
 * @returns {Promise<Response>} - A response with status 204 and CORS headers.
 */
export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  setCorsHeaders(response);
  return response;
}

/**
 * GET endpoint to retrieve products from a contract page.
 *
 * Expects the following query parameters:
 *  - erc721ContractAddress: The ERC721 contract address used as a parameter.
 *  - network: The supported network (e.g., "ethereum" or "sepolia").
 *
 * Process:
 * 1. (Optionally) Await user identification.
 * 2. Parse and validate query parameters.
 * 3. Build an ethers provider based on the network parameter.
 * 4. Retrieve the corresponding contract address using getMerchNFTCollectionProductSmertContract.
 * 5. Create a contract instance with the MERCH_NFT_COLLECTION_PRODUCTS_ABI.
 * 6. Call the contract's PAGE_SIZE_PRODUCT() function to get the page size.
 * 7. Loop over pages starting at 1, calling getProductsByContractPage() for each page.
 *    After each call, check if the total number of products retrieved equals page * pageSize.
 *    If yes, then call again for the next page; otherwise, break the loop.
 * 8. Map the combined raw product arrays into objects with the desired key names,
 *    converting values to numbers and using wgiToEth and getPrecent for the price field.
 * 9. For each product, fetch additional details from Firestore at
 *    productsBlockchain/{productID} (description, title, imageUrls).
 * 10. Return a JSON response with the combined products data.
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<Response>} - A JSON response with the products or an error message.
 */
export async function GET(request) {
  try {
    // (Optional) Uncomment if you need to retrieve the user id.
    // await getUserIdFromRequest(request);

    const { searchParams } = new URL(request.url);
    const erc721ContractAddress = searchParams.get('erc721ContractAddress');
    const network = searchParams.get('network');

    if (!erc721ContractAddress || !network) {
      const missingParams = [];
      if (!erc721ContractAddress) missingParams.push('erc721ContractAddress');
      if (!network) missingParams.push('network');
      const missingResponse = new Response(
        JSON.stringify({ error: `Missing query parameter(s): ${missingParams.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
      setCorsHeaders(missingResponse);
      return missingResponse;
    }

    // Get an ethers provider based on the request's network parameter.
    const provider = getProviderFromInteractWithContract(request);

    // Retrieve the contract address from the configuration based on the network.
    const { contractAddress } = getMerchNFTCollectionProductSmertContract(network);

    // Instantiate the contract using the provided ABI and address.
    const contract = new Contract(contractAddress, MERCH_NFT_COLLECTION_PRODUCTS_ABI, provider);

    // Get the page size from the contract.
    const pageSizeBig = await contract.PAGE_SIZE_PRODUCT();
    const pageSize = Number(pageSizeBig);
    console.log('PAGE_SIZE_PRODUCT:', pageSize);

    // Initialize our loop to fetch all pages.
    let allRawProducts = [];
    let page = 1;
    while (true) {
      // Get products from current page.
      const rawProducts = await contract.getProductsByContractPage(erc721ContractAddress, page);
      allRawProducts = allRawProducts.concat(rawProducts);

      // If total number of products retrieved is less than page * pageSize, break out.
      if (allRawProducts.length < page * pageSize) {
        break;
      }
      page++;
    }

    // Map raw product arrays to structured objects.
    let products = allRawProducts.map((product) => ({
      nftCollectionAddress: product[0],
      timestampCreated: Number(product[1]),
      productID: product[2],
      price: {
        wei: Number(product[4][0]),
        eth: wgiToEth(Number(product[4][0])),
        discount: Number(product[4][1]),
        discountPercent: getPrecent(Number(product[4][1]))
      },
      totalQtyStock: Number(product[5]),
      maxQtyPerCustomer: Number(product[6]),
      qtySold: Number(product[7]),
      ordersID: product[8]
    }));

    // For each product, retrieve additional details from Firestore.
    products = await Promise.all(products.map(async (product) => {
      try {
        const productDoc = await firestore.collection('productsBlockchain').doc(product.productID).get();
        if (productDoc.exists) {
          console.log("productDoc.exists");
          const data = productDoc.data();
          return {
            ...product,
            productDetails: {
              title: data.title || null,
              description: data.description || null,
              imageUrls: data.imageUrls || []
            }
          };
        }
        return { ...product, productDetails: null };
      } catch (e) {
        console.error(`Error retrieving details for product ${product.productID}:`, e);
        return { ...product, productDetails: null };
      }
    }));

    // Build and return the final result.
    const result = { products };
    const response = new Response(safeStringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    setCorsHeaders(response);
    return response;
  } catch (error) {
    console.error("Error in getProductsByContractPage:", error);
    const errResponse = new Response(
      JSON.stringify({ error: error.message || 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
    setCorsHeaders(errResponse);
    return errResponse;
  }
}