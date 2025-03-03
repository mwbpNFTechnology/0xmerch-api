// config/contractConfig.ts

/**
 * Enum representing supported networks.
 */
 export enum SupportedNetwork {
  Ethereum = 'ethereum',
  Sepolia = 'sepolia',
}

/**
 * Mapping of supported networks to the corresponding 0xMerchSmert contract addresses.
 */
export const MerchSmertContractAddresses: Record<SupportedNetwork, string> = {
  [SupportedNetwork.Ethereum]: "0xda45Eaf463D5544Ca3921125eB9fa0633508E1A2",
  [SupportedNetwork.Sepolia]: "0x5E70a8F9Bf45Fe1CcDb0D524D7c75c8C27C354C1",
};

/**
 * The ABI for the 0xMerchSmert contract.
 */
export const MerchSmertContractAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "getContractAddressesAssigned",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_erc721Address",
        "type": "address"
      }
    ],
    "name": "getContractInfoByContract",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "contractName",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "contractAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "royalties",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "uuid0xMerch",
            "type": "string"
          }
        ],
        "internalType": "struct AlphaProject.ContractInfo",
        "name": "info",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "getContractInfosByOwner",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "contractName",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "contractAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "royalties",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "uuid0xMerch",
            "type": "string"
          }
        ],
        "internalType": "struct AlphaProject.ContractInfo[]",
        "name": "infos",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "ownerContracts",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_erc721Address",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_royalties",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_uuid0xMerch",
        "type": "string"
      }
    ],
    "name": "registerContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "registeredContracts",
    "outputs": [
      {
        "internalType": "string",
        "name": "contractName",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "royalties",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "uuid0xMerch",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_erc721Address",
        "type": "address"
      }
    ],
    "name": "removeContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_erc721Address",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_newRoyalties",
        "type": "uint256"
      }
    ],
    "name": "updateRoyalties",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

/**
 * Returns the 0xMerchSmert contract information based on the provided network.
 *
 * @param network The supported network (ethereum or sepolia).
 * @returns An object containing the contract address and its ABI.
 */
export function getMerchSmertContractInfo(network: SupportedNetwork): { contractAddress: string; abi: any[] } {
  return {
    contractAddress: MerchSmertContractAddresses[network],
    abi: MerchSmertContractAbi
  };
}