// app/api/0xmerchSetting/settings/route.js

import { Contract } from 'ethers';
import { setCorsHeaders } from '../../../lib/utils/cors';
import { getProviderFromInteractWithContract } from '../../../lib/utils/blockchainNetworkUtilis';
import { getMerchSmertContract, MERCH_ABI, SupportedNetwork } from '../../../config/contractConfig';
import { getUserIdFromRequest } from '../../../lib/utils/serverFirebaseUtils';

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
 * GET endpoint to retrieve the maxRoyalties value from the 0xMerchSmert contract.
 * This route is protected: only an authenticated Firebase user can call it.
 * 
 * Expects the following query parameter:
 *   - network: the network to use ("ethereum" or "sepolia").
 *
 * Process:
 * 1. Verifies the Firebase ID token to ensure the caller is authenticated.
 * 2. Reads the `network` from the URL's query parameters and validates it.
 * 3. Uses the getProviderFromInteractWithContract utility to build a provider.
 * 4. Retrieves the contract address and ABI via getMerchSmertContract using the normalized network.
 * 5. Instantiates the contract and calls the read function maxRoyalties().
 * 6. Returns a JSON response with { maxRoyalties }.
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<Response>} - A JSON response containing the maxRoyalties or an error message.
 */
export async function GET(request) {
  try {
    // Ensure the request is from an authenticated user.
    await getUserIdFromRequest(request);

    const { searchParams } = new URL(request.url);
    const networkParam = searchParams.get('network');

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

    // Call the maxRoyalties() function.
    const maxRoyaltiesRaw = await contract.maxRoyalties();
    const maxRoyalties = Number(maxRoyaltiesRaw);

    // Build the result object.
    const result = { maxRoyalties };

    const response = new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    return setCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching maxRoyalties:", error);
    const errResponse = new Response(
      JSON.stringify({ error: error.message || 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
    return setCorsHeaders(errResponse);
  }
}