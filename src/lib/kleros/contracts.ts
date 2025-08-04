
// Basic Multiple Arbitrable Transaction ABI with required functions
export const multipleArbitrableTransactionABI = [
  {
    "name": "createTransaction",
    "type": "function",
    "inputs": [
      { "name": "_metaEvidenceID", "type": "uint256" },
      { "name": "_receiver", "type": "address" },
      { "name": "_metaEvidence", "type": "string" }
    ],
    "outputs": [{ "name": "transactionID", "type": "uint256" }],
    "stateMutability": "payable"
  },
  {
    "name": "getTransactionIDsByAddress",
    "type": "function",
    "inputs": [{ "name": "_address", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view"
  },
  {
    "name": "getCountTransactions",
    "type": "function",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "name": "transactions",
    "type": "function",
    "inputs": [{ "name": "_transactionID", "type": "uint256" }],
    "outputs": [
      { "name": "sender", "type": "address" },
      { "name": "receiver", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "timeoutPayment", "type": "uint256" },
      { "name": "disputeId", "type": "uint256" },
      { "name": "senderFee", "type": "uint256" },
      { "name": "receiverFee", "type": "uint256" },
      { "name": "lastInteraction", "type": "uint256" },
      { "name": "status", "type": "uint8" }
    ],
    "stateMutability": "view"
  }
];

// Multiple Arbitrable Transaction with ERC20 Token support ABI
export const multipleArbitrableTransactionTokensABI = [
  {
    "name": "createTransaction",
    "type": "function",
    "inputs": [
      { "name": "_amount", "type": "uint256" },
      { "name": "_token", "type": "address" },
      { "name": "_timeoutPayment", "type": "uint256" },
      { "name": "_receiver", "type": "address" },
      { "name": "_metaEvidence", "type": "string" }
    ],
    "outputs": [{ "name": "transactionIndex", "type": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "name": "getTransactionIDsByAddress",
    "type": "function",
    "inputs": [{ "name": "_address", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view"
  },
  {
    "name": "getCountTransactions",
    "type": "function",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "name": "transactions",
    "type": "function",
    "inputs": [{ "name": "_transactionID", "type": "uint256" }],
    "outputs": [
      { "name": "sender", "type": "address" },
      { "name": "receiver", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "token", "type": "address" },
      { "name": "timeoutPayment", "type": "uint256" },
      { "name": "disputeId", "type": "uint256" },
      { "name": "senderFee", "type": "uint256" },
      { "name": "receiverFee", "type": "uint256" },
      { "name": "lastInteraction", "type": "uint256" },
      { "name": "status", "type": "uint8" }
    ],
    "stateMutability": "view"
  },
  {
    "name": "pay",
    "type": "function",
    "inputs": [
      { "name": "_transactionID", "type": "uint256" },
      { "name": "_amount", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "reimburse",
    "type": "function",
    "inputs": [
      { "name": "_transactionID", "type": "uint256" },
      { "name": "_amountReimbursed", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];

// Standard ERC20 ABI for token operations
export const erc20ABI = [
  {
    "name": "transfer",
    "type": "function",
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "name": "transferFrom",
    "type": "function",
    "inputs": [
      { "name": "_from", "type": "address" },
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "name": "approve",
    "type": "function",
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "name": "allowance",
    "type": "function",
    "inputs": [
      { "name": "_owner", "type": "address" },
      { "name": "_spender", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "name": "balanceOf",
    "type": "function",
    "inputs": [{ "name": "_owner", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "name": "decimals",
    "type": "function",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view"
  },
  {
    "name": "symbol",
    "type": "function",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "name": "name",
    "type": "function",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  }
];

// Contract addresses for different transaction types
export const CONTRACT_ADDRESSES = {
  // ETH-based transactions
  MULTIPLE_ARBITRABLE_TRANSACTION: "0x0d67440946949fe293b45c52efd8a9b3d51e2522",
  
  // ERC20 token-based transactions
  MULTIPLE_ARBITRABLE_TRANSACTION_TOKENS: "0xBCf0d1AD453728F75e9cFD4358ED187598A45e6c"
};

export const klerosConfig = {
  provider: {
    url: "https://ethereum.publicnode.com",
    networkId: 1, // Ethereum mainnet
  },
  multipleArbitrableTransactionEth: {
    address: CONTRACT_ADDRESSES.MULTIPLE_ARBITRABLE_TRANSACTION,
  },
  ipfsGateway: "https://cdn.kleros.link",
  subgraphUrl: "https://api.studio.thegraph.com/query/74379/kleros-escrow-v1/version/latest",
};

export const tokenConfig = {
  provider: {
    url: "https://ethereum.publicnode.com",
    networkId: 1, // Ethereum mainnet
  },
  multipleArbitrableTransactionToken: {
    address: CONTRACT_ADDRESSES.MULTIPLE_ARBITRABLE_TRANSACTION_TOKENS,
  },
  ipfsGateway: "https://cdn.kleros.link",
  subgraphUrl: "https://api.studio.thegraph.com/query/74379/kleros-escrow-v1-erc20-subgraph/version/latest",
};
