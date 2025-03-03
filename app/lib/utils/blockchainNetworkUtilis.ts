import { JsonRpcProvider } from 'ethers';

/**
 * Enum representing supported networks.
 */
export enum SupportedNetwork {
  Ethereum = 'ethereum',
  Sepolia = 'sepolia',
}

/**
 * Mapping from SupportedNetwork values to a function that returns the provider URL.
 */
const providerUrlContractInteractMapping: Record<SupportedNetwork, (apiKey: string) => string> = {
  [SupportedNetwork.Ethereum]: (apiKey: string) =>
    `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`,
  [SupportedNetwork.Sepolia]: (apiKey: string) =>
    `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`,
};

/**
 * Mapping from SupportedNetwork values to a function that returns the provider URL.
 */
 const providerUrlNFTEndpointMapping: Record<SupportedNetwork, (apiKey: string) => string> = {
    [SupportedNetwork.Ethereum]: (apiKey: string) =>
      `https://eth-mainnet.g.alchemy.com/nft/v3/${apiKey}`,
    [SupportedNetwork.Sepolia]: (apiKey: string) =>
      `https://eth-sepolia.g.alchemy.com/nft/v3/${apiKey}`,
  };

/**
 * Returns an ethers provider based on the "network" query parameter in the request URL.
 * Throws an error if the network parameter is missing, the API key is not configured,
 * or if an unsupported network is specified.
 *
 * @param request The Request object containing the query parameters.
 * @returns A JsonRpcProvider configured for the specified network.
 * @throws Error if the required parameter is missing or not supported.
 */
export function getProviderFromInteractWithContract(request: Request): JsonRpcProvider {
  const { searchParams } = new URL(request.url);
  const networkParam = searchParams.get('network');
  if (!networkParam) {
    throw new Error("Missing 'network' query parameter");
  }
  
  if (!Object.values(SupportedNetwork).includes(networkParam as SupportedNetwork)) {
    throw new Error(`Unsupported network: ${networkParam}`);
  }
  const network = networkParam as SupportedNetwork;

  // Retrieve the Alchemy API key from environment variables.
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    throw new Error("Alchemy API key not configured");
  }

  // Use the mapping to get the provider URL.
  const providerURL = providerUrlContractInteractMapping[network](apiKey);
  return new JsonRpcProvider(providerURL);
}

/**
 * Returns the NFT endpoint URL based on the "network" query parameter in the request URL.
 * Throws an error if the network parameter is missing, the API key is not configured,
 * or if an unsupported network is specified.
 *
 * @param request The Request object containing the query parameters.
 * @returns The base URL for NFT API endpoints configured for the specified network.
 * @throws Error if the required parameter is missing or not supported.
 */
 export function getProviderUrlNFTEndpoint(request: Request): string {
    const { searchParams } = new URL(request.url);
    const networkParam = searchParams.get('network');
    if (!networkParam) {
      throw new Error("Missing 'network' query parameter");
    }
  
    if (!Object.values(SupportedNetwork).includes(networkParam as SupportedNetwork)) {
      throw new Error(`Unsupported network: ${networkParam}`);
    }
    const network = networkParam as SupportedNetwork;
  
    // Retrieve the Alchemy API key from environment variables.
    const apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) {
      throw new Error("Alchemy API key not configured");
    }
  
    // Use the mapping to get the NFT endpoint provider URL.
    const endpointURL = providerUrlNFTEndpointMapping[network](apiKey);
    return endpointURL;
  }