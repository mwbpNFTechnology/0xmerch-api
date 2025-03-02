// app/api/contractMetadata/route.js

// Import the global CORS helper.
import { setCorsHeaders } from '../../../lib/utils/cors';

/**
 * GET endpoint to fetch NFT collection data from Alchemy and return selected contract metadata.
 * Expects a query parameter `contractAddress`.
 *
 * Process:
 * 1. Reads the contractAddress from the URL's query parameters.
 * 2. Retrieves the Alchemy API key from environment variables.
 * 3. Calls the Alchemy getNFTsForCollection endpoint with metadata enabled.
 * 4. Extracts the contract name, contract deployer, and image URL from the first NFT in the collection.
 *    If contract.openSeaMetadata.imageUrl is null, it falls back to nft.image.cachedUrl.
 * 5. Returns the data as JSON.
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

    // Retrieve the Alchemy API key from environment variables.
    const alchemyApiKey = process.env.ALCHEMY_API_KEY;
    if (!alchemyApiKey) {
      const keyErrorResponse = new Response(
        JSON.stringify({ error: 'Alchemy API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
      return setCorsHeaders(keyErrorResponse);
    }


    // Build the Alchemy API URL for getNFTsForCollection with metadata enabled.
    const alchemyUrl = `https://eth-sepolia.g.alchemy.com/nft/v3/${alchemyApiKey}/getNFTsForCollection?contractAddress=${contractAddress}&withMetadata=true`;

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
    const data = await alchemyResponse.json();
    const nfts = data.nfts;
    if (!nfts || nfts.length === 0) {
      const noNFTsResponse = new Response(
        JSON.stringify({ error: 'No NFTs found for this contract' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
      return setCorsHeaders(noNFTsResponse);
    }

    // Use the first NFT in the collection.
    const nft = nfts[0];
    const contract = nft.contract || {};
    const contractName = contract.name || null;
    const contractDeployer = contract.contractDeployer || null;
    
    // Try to get openSeaMetadata.imageUrl; if not available, fall back to nft.image.cachedUrl.
    let imageUrl = contract.openSeaMetadata ? contract.openSeaMetadata.imageUrl : null;
    if (!imageUrl) {
      imageUrl = nft.image ? nft.image.cachedUrl : null;
    }
    
    // Build the result object.
    const result = {
      contractName,
      contractDeployer,
      imageUrl
    };
    
    // Return the result as JSON.
    const response = new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    return setCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching NFT contract metadata:", error);
    const errorResponse = new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
    return setCorsHeaders(errorResponse);
  }
}