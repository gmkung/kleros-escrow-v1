
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

export const klerosConfig = {
  provider: {
    url: "https://ethereum.publicnode.com",
    networkId: 1, // Ethereum mainnet
  },
  multipleArbitrableTransaction: {
    address: "0x0d67440946949FE293B45c52eFD8A9b3d51e2522",
    abi: multipleArbitrableTransactionABI, // Properly formatted ABI
  },
  ipfsGateway: "https://cdn.kleros.link",
};
