// app/api/nfts/getContractsByOwner/route.js

import { Contract } from 'ethers';
import { setCorsHeaders } from '../../../lib/utils/cors';
import { getProviderFromInteractWithContract } from '../../../lib/utils/blockchainNetworkUtilis';
import { getMerchSmertContract, MERCH_ABI, SupportedNetwork } from '../../../config/contractConfig';
import { getFirestoreInstance } from '../../../lib/utils/serverFirebaseUtils';

// Retrieve the Firestore instance using your centralized Firebase Admin utility.
const firestore = getFirestoreInstance();

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
 * GET endpoint to retrieve contract information assigned to a given owner.
 * 
 * Expects the following query parameters:
 *   - ownerAddress: the owner address to query for.
 *   - network: the network to use ("ethereum" or "sepolia").
 *
 * Process:
 * 1. Reads the `ownerAddress` and `network` from the URL's query parameters.
 * 2. Validates that both parameters are provided and that the network is supported.
 * 3. Uses the getProviderFromInteractWithContract utility to build a provider.
 * 4. Retrieves the contract address and ABI via getMerchSmertContract using the normalized network.
 * 5. Instantiates the contract and calls the read function getContractInfosByOwner(ownerAddress).
 * 6. Maps over the raw result to produce an array of objects with keys:
 *    - contractName
 *    - contractAddress
 *    - contractOwner
 *    - royalties (as number)
 *    - uuid0xMERCH
 * 7. For each contract, retrieves the collection image URL from Firestore (from nftCollections/{contractAddress} field imageURL)
 *    and attaches it to the object as "imageURL".
 * 8. Returns a JSON response containing the contract infos.
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<Response>} - A JSON response containing the contract infos or an error message.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerAddress = searchParams.get('ownerAddress');
    const networkParam = searchParams.get('network');

    if (!ownerAddress) {
      const missingOwner = new Response(
        JSON.stringify({ error: 'Missing ownerAddress query parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
      return setCorsHeaders(missingOwner);
    }
    if (!networkParam) {
      const missingNetwork = new Response(
        JSON.stringify({ error: 'Missing network query parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
      return setCorsHeaders(missingNetwork);
    }
    // Normalize network to lowercase.
    const normalizedNetwork = networkParam.toLowerCase();
    if (!Object.values(SupportedNetwork).includes(normalizedNetwork)) {
      const invalidNetwork = new Response(
        JSON.stringify({ error: `Unsupported network: ${networkParam}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
      return setCorsHeaders(invalidNetwork);
    }

    // Get provider for contract interactions.
    const provider = getProviderFromInteractWithContract(request);

    // Get the contract address and ABI for the merchSmert contract.
    const { contractAddress } = getMerchSmertContract(normalizedNetwork);

    // Instantiate the contract.
    const contract = new Contract(contractAddress, MERCH_ABI, provider);

    // Call the read function: getContractInfosByOwner(ownerAddress)
    const rawInfos = await contract.getContractInfosByOwner(ownerAddress);
    // rawInfos is assumed to be an array of tuples:
    // [ [contractName, contractAddress, contractOwner, royalties, uuid0xMERCH], ... ]
    const contractInfos = await Promise.all(rawInfos.map(async (info) => {
      // Retrieve imageURL from Firestore document at nftCollections/{contractAddress}
      const docRef = firestore.doc(`nftCollections/${info[1]}`);
      const docSnap = await docRef.get();
      const firebaseData = docSnap.exists ? docSnap.data() : {};
      const firebaseImageURL = firebaseData ? firebaseData.imageURL : null;

      return {
        contractName: info[0],
        contractAddress: info[1],
        contractOwner: info[2],
        royalties: info[3] !== undefined ? Number(info[3]) : null,
        uuid0xMERCH: info[4],
        imageURL: firebaseImageURL,
      };
    }));

    const result = { contractInfos };

    const response = new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    return setCorsHeaders(response);
  } catch (error) {
    console.error("Error in getContractsByOwner route:", error);
    const errResponse = new Response(
      JSON.stringify({ error: error.message || 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
    return setCorsHeaders(errResponse);
  }
}