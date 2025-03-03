// app/api/nfts/getErc721Owner/route.js

import { JsonRpcProvider, Contract } from 'ethers';
import { setCorsHeaders } from '../../../lib/utils/cors';
import { getProviderFromInteractWithContract } from '../../../lib/utils/blockchainNetworkUtilis';
// (Optional) Uncomment if authentication is required.
// import { getUserAuthToken } from '../../../lib/utils/serverFirebaseUtils';

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
 * GET endpoint to retrieve the owner of an ERC721 contract using ethers.
 * Expects a query parameter `erc721ContractAddress` and a required `network` query parameter.
 *
 * Process:
 * 1. Reads the `erc721ContractAddress` from the URL's query parameters.
 * 2. Uses the `getProviderFromRequest` utility to build a provider based on the `network` parameter.
 * 3. Creates a contract instance with a minimal Ownable ABI.
 * 4. Calls the contract's owner() function.
 * 5. Returns a JSON response with { ownerAddress }.
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<Response>} - A JSON response containing the owner address or an error message.
 */
export async function GET(request) {
  try {
    // (Optional) Uncomment if authentication is required.
    // await getUserAuthToken(request);

    // Parse the erc721ContractAddress from the query parameters.
    const { searchParams } = new URL(request.url);
    const erc721ContractAddress = searchParams.get('erc721ContractAddress');
    if (!erc721ContractAddress) {
      const missingResponse = new Response(
        JSON.stringify({ error: 'Missing erc721ContractAddress query parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
      setCorsHeaders(missingResponse);
      return missingResponse;
    }

    // Use the utility to get an ethers provider based on the network query parameter.
    // This function throws an error if the network parameter is missing.
    const provider = getProviderFromInteractWithContract(request);

    // Define a minimal Ownable ABI.
    const ownableAbi = [
      "function owner() view returns (address)"
    ];

    // Create a contract instance using the ERC721 contract address.
    const contract = new Contract(erc721ContractAddress, ownableAbi, provider);

    // Call the owner() function to retrieve the owner address.
    const ownerAddress = await contract.owner();

    // Build the result object.
    const result = { ownerAddress };

    // Return the result as JSON.
    const response = new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    setCorsHeaders(response);
    return response;
  } catch (error) {
    console.error("Error fetching ERC721 owner:", error);
    // Return the actual error message from the thrown error.
    const errResponse = new Response(
      JSON.stringify({ error: error.message || 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
    setCorsHeaders(errResponse);
    return errResponse;
  }
}