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
  [SupportedNetwork.Ethereum]: "",
  [SupportedNetwork.Sepolia]: "0x3088E68216e94502ea7AA38e8139edF274acC4E4",
};

/**
 * The ABI for the 0xMerchSmert contract.
 */
export const MERCH_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
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
    "inputs": [],
    "name": "maxRoyalties",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
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
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_newMaxRoyalties",
        "type": "uint256"
      }
    ],
    "name": "updateMaxRoyalties",
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
 * @returns An contractAddress base on the network.
 */
export function getMerchSmertContract(network: SupportedNetwork): { contractAddress: string } {
  return {
    contractAddress: MerchSmertContractAddresses[network],
  };
}