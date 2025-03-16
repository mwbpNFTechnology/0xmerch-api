import { Contract } from 'ethers';
import { setCorsHeaders } from '../../../../lib/utils/cors';
import { getProviderFromInteractWithContract } from '../../../../lib/utils/blockchainNetworkUtilis';
// (Optional) Uncomment if user identification is needed.
// import { getUserIdFromRequest } from '../../../../lib/utils/serverFirebaseUtils';

import { MERCH_NFT_COLLECTION_PRODUCTS_ABI, getMerchNFTCollectionProductSmertContract } from '../../../../config/contractConfig';
import { wgiToEth, getPrecent } from '../../../../lib/utils/numberUtils';
import { getFirestoreInstance } from '../../../../lib/utils/serverFirebaseUtils';

const firestore = getFirestoreInstance();

function safeStringify(data) {
  return JSON.stringify(data, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );
}

export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  setCorsHeaders(response);
  return response;
}

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
      const rawProducts = await contract.getProductsByContractPage(erc721ContractAddress, page);
      allRawProducts = allRawProducts.concat(rawProducts);
      if (allRawProducts.length < page * pageSize) {
        break;
      }
      page++;
    }

    // Map raw product arrays into blockchain data.
    const blockchainProducts = allRawProducts.map((product) => ({
      nftCollectionAddress: product[0],
      timestampCreated: Number(product[1]),
      productID: product[2],
      price: {
        wei: Number(product[3][0]),
        eth: wgiToEth(Number(product[3][0])),
        discount: Number(product[3][1]),
        discountPercent: getPrecent(Number(product[3][1]))
      },
      totalQtyStock: Number(product[5]),
      maxQtyPerCustomer: Number(product[5]), // Ensure this index is correct.
      qtySold: Number(product[6]),
      ordersID: product[7]
    }));

    // For each product, retrieve additional details from Firestore.
    const products = await Promise.all(blockchainProducts.map(async (bp) => {
      try {
        const productDoc = await firestore.collection('productsBlockchain').doc(bp.productID).get();
        let dbData = { title: null, description: null, imageUrls: [] };
        if (productDoc.exists) {
          const data = productDoc.data();
          dbData = {
            title: data.title || null,
            description: data.description || null,
            imageUrls: data.imageUrls || []
          };
        } else {
          console.warn(`No Firestore document found for productID: ${bp.productID}`);
        }
        return {
          fromBlockchain: bp,
          fromDB: dbData
        };
      } catch (e) {
        console.error(`Error retrieving details for product ${bp.productID}:`, e);
        return {
          fromBlockchain: bp,
          fromDB: null
        };
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