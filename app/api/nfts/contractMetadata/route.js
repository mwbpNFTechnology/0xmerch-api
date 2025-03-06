// app/api/nfts/contractMetadata/route.js
//TODO: need add await getUserIdFromRequest(request);

// Import the global CORS helper.
import { setCorsHeaders } from '../../../lib/utils/cors';
// Import the NFT endpoint URL utility and provider utility.
import { getProviderUrlNFTEndpoint, getProviderFromInteractWithContract } from '../../../lib/utils/blockchainNetworkUtilis';
// Import ethers (import everything so that ethers.Contract is available).
import * as ethers from 'ethers';

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
 * GET endpoint to fetch NFT collection metadata from Alchemy and retrieve the ERC721 contract owner.
 * Expects query parameters:
 *   - contractAddress: the contract address to query.
 *   - network: the network to use ("ethereum" or "sepolia").
 *
 * Process:
 * 1. Reads the contractAddress from the URL's query parameters.
 * 2. Uses the getProviderUrlNFTEndpoint utility to build the base NFT API endpoint URL.
 * 3. Constructs the full Alchemy API URL for getNFTsForCollection with metadata enabled.
 * 4. Extracts the contract name, contract deployer, and image URL from the first NFT in the collection.
 *    If contract.openSeaMetadata.imageUrl is null, it falls back to nft.image.cachedUrl.
 * 5. Uses getProviderFromInteractWithContract to obtain a provider for contract interactions.
 * 6. Creates a contract instance (using a minimal Ownable ABI) and calls the owner() function.
 * 7. Returns a JSON response with { contractName, contractDeployer, contractOwner, imageUrl }.
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<Response>} - A JSON response containing the contract metadata or an error message.
 */
export async function GET(request) {
  try {
    // Parse the contractAddress from the query string.
    const { searchParams } = new URL(request.url);
    const contractAddress = searchParams.get('contractAddress');

    if (!contractAddress) {
      const missingResponse = new Response(
        JSON.stringify({ error: 'Missing contractAddress query parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
      return setCorsHeaders(missingResponse);
    }

    // Use the utility to get the NFT API endpoint URL based on the "network" query parameter.
    const nftEndpointUrl = getProviderUrlNFTEndpoint(request);

    // Build the full Alchemy API URL for getNFTsForCollection with metadata enabled.
    const alchemyUrl = `${nftEndpointUrl}/getNFTsForCollection?contractAddress=${encodeURIComponent(contractAddress)}&withMetadata=true`;

    // Call the Alchemy endpoint.
    const alchemyResponse = await fetch(alchemyUrl);
    if (!alchemyResponse.ok) {
      const errorData = await alchemyResponse.json().catch(() => ({}));
      const fetchErrorResponse = new Response(
        JSON.stringify({ error: errorData.error || 'Error fetching data from Alchemy' }),
        { status: alchemyResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
      return setCorsHeaders(fetchErrorResponse);
    }

    // Parse the response.
    const nftData = await alchemyResponse.json();
    const nfts = nftData.nfts;
    if (!nfts || nfts.length === 0) {
      const noNFTsResponse = new Response(
        JSON.stringify({ error: 'No NFTs found for this contract' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
      return setCorsHeaders(noNFTsResponse);
    }

    // Use the first NFT in the collection.
    const nft = nfts[0];
    const contractMeta = nft.contract || {};
    const contractName = contractMeta.name || null;
    const contractDeployer = contractMeta.contractDeployer || null;
    
    // Try to get openSeaMetadata.imageUrl; if not available, fall back to nft.image.cachedUrl.
    let imageUrl = contractMeta.openSeaMetadata ? contractMeta.openSeaMetadata.imageUrl : null;
    if (!imageUrl) {
      imageUrl = nft.image ? nft.image.cachedUrl : null;
    }

    // Use the utility to get an ethers provider for contract interaction.
    const provider = getProviderFromInteractWithContract(request);
    // Define a minimal Ownable ABI.
    const ownableAbi = [
      "function owner() view returns (address)"
    ];
    // Create a contract instance using the contract address.
    const contract = new ethers.Contract(contractAddress, ownableAbi, provider);
    // Call the owner() function.
    const ownerAddress = await contract.owner();

    // Build the result object.
    const result = {
      contractName,
      contractAddress,
      contractDeployer,
      contractOwner: ownerAddress,
      imageUrl
    };

    // Return the result as JSON.
    const response = new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    return setCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching contract metadata and owner:", error);
    const errResponse = new Response(
      JSON.stringify({ error: error.message || 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
    return setCorsHeaders(errResponse);
  }
}