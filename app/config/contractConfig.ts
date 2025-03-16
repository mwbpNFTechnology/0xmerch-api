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
export const MERCH_SMART_CONTRACT_ADDRESS: Record<SupportedNetwork, string> = {
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
    contractAddress: MERCH_SMART_CONTRACT_ADDRESS[network],
  };
}


/**
 * Mapping of supported networks to the corresponding 0xMerchSmertNFTCollectionProducts contract addresses.
 */
 export const MERCH_NFT_COLLECTION_PRODUCTS_SMART_CONTRACT_ADDRESS: Record<SupportedNetwork, string> = {
  [SupportedNetwork.Ethereum]: "",
  [SupportedNetwork.Sepolia]: "0x212C72A79550c4DCf8dFFCdE7C369200CfCf8E26",
};

/**
 * The ABI for the updated AlphaProject contract.
 * (Note: The tuple/struct definitions remain identical to the original contract’s design.)
 */
 export const MERCH_NFT_COLLECTION_PRODUCTS_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_alphaContract",
        "type": "address"
      }
    ],
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
    "inputs": [],
    "name": "PAGE_SIZE_ORDER",
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
    "name": "PAGE_SIZE_ORDER_ID",
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
    "name": "PAGE_SIZE_PRODUCT",
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
    "inputs": [
      {
        "internalType": "string",
        "name": "_productID",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_cid",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_regularPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_discountNFTholder",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_totalQtyStock",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_maxQtyPerCustomer",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_erc721ContractAddress",
        "type": "address"
      }
    ],
    "name": "addProduct",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "alphaProjectContract",
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
    "name": "contractProductsID",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_productID",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_qty",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_merchUUID",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_orderID",
        "type": "string"
      },
      {
        "internalType": "uint256[]",
        "name": "_nftTokenIDsForDoscount",
        "type": "uint256[]"
      }
    ],
    "name": "createNewOrder",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_productID",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "page",
        "type": "uint256"
      }
    ],
    "name": "getOrdersByProductPage",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "orderID",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestampCreated",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "productID",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "orderBy",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "merchUUID",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "qty",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "orderTotalAmount",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "complated",
            "type": "bool"
          }
        ],
        "internalType": "struct AlphaProjectProduct.Order[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_productID",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "page",
        "type": "uint256"
      }
    ],
    "name": "getOrdersIdByProductPage",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_erc721ContractAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "page",
        "type": "uint256"
      }
    ],
    "name": "getProductsByContractPage",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "contractAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestampCreated",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "productID",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "regularPrice",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "discountNFTholder",
                "type": "uint256"
              }
            ],
            "internalType": "struct AlphaProjectProduct.Price",
            "name": "price",
            "type": "tuple"
          },
          {
            "internalType": "uint256",
            "name": "totalQtyStock",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxQtyPerCustomer",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "qtySold",
            "type": "uint256"
          },
          {
            "internalType": "string[]",
            "name": "ordersID",
            "type": "string[]"
          }
        ],
        "internalType": "struct AlphaProjectProduct.ProductInfoData[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "orders",
    "outputs": [
      {
        "internalType": "string",
        "name": "orderID",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "timestampCreated",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "productID",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "orderBy",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "merchUUID",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "qty",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "orderTotalAmount",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "complated",
        "type": "bool"
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
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "productsInfos",
    "outputs": [
      {
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timestampCreated",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "productID",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "cid",
        "type": "string"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "regularPrice",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "discountNFTholder",
            "type": "uint256"
          }
        ],
        "internalType": "struct AlphaProjectProduct.Price",
        "name": "price",
        "type": "tuple"
      },
      {
        "internalType": "uint256",
        "name": "totalQtyStock",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxQtyPerCustomer",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "qtySold",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "redeemNFTTokenIdDiscount",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_productID",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_orderID",
        "type": "string"
      }
    ],
    "name": "releasePayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_productID",
        "type": "string"
      }
    ],
    "name": "removeProduct",
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
        "internalType": "uint256",
        "name": "newPageSizeOrder",
        "type": "uint256"
      }
    ],
    "name": "setPageSizeOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newPageSizeOrderID",
        "type": "uint256"
      }
    ],
    "name": "setPageSizeOrderID",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newPageSizeProduct",
        "type": "uint256"
      }
    ],
    "name": "setPageSizeProduct",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "totalQtyPurchasedPerCustomer",
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
  }
];

/**
 * Returns the 0xMerchSmert contract information based on the provided network.
 *
 * @param network The supported network (ethereum or sepolia).
 * @returns An contractAddress base on the network.
 */
 export function getMerchNFTCollectionProductSmertContract(network: SupportedNetwork): { contractAddress: string } {
  return {
    contractAddress: MERCH_NFT_COLLECTION_PRODUCTS_SMART_CONTRACT_ADDRESS[network],
  };
}
