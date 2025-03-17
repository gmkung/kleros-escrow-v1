
import { createKlerosEscrowClient } from "kleros-escrow-data-service";
import { ethers } from "ethers";

const klerosConfig = {
  provider: {
    url: "https://ethereum.publicnode.com",
    networkId: 1, // Ethereum mainnet
  },
  multipleArbitrableTransaction: {
    address: "0x0d67440946949FE293B45c52eFD8A9b3d51e2522",
  },
  ipfsGateway: "https://cdn.kleros.link",
};

// Create a read-only client
export const klerosClient = createKlerosEscrowClient(klerosConfig);

// This function creates a connected client with a signer when needed
export const createSignerClient = async () => {
  if (typeof window !== "undefined" && window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    return createKlerosEscrowClient(klerosConfig, signer);
  }
  throw new Error("Ethereum provider not available");
};

// Type definitions for transaction data
export interface MetaEvidenceEvent {
  id: string;
  blockTimestamp: string;
  transactionHash: string;
  _evidence: string;
  blockNumber: string;
  _metaEvidenceID: string;
}

export interface MetaEvidence {
  category: string;
  title: string;
  description: string;
  question: string;
  rulingOptions: {
    type: string;
    titles: string[];
    descriptions: string[];
  };
  subCategory?: string;
  sender?: string;
  receiver?: string;
  amount?: string;
  timeout?: number;
  fileURI?: string;
  fileTypeExtension?: string;
}

export interface TransactionEvents {
  metaEvidences: {
    id: string;
    blockTimestamp: string;
    transactionHash: string;
    _evidence: string;
    blockNumber: string;
  }[];
  payments: {
    id: string;
    _transactionID: string;
    _amount: string;
    _party: string;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
  }[];
  evidences: {
    _arbitrator: string;
    _party: string;
    _evidence: string;
    _evidenceGroupID: string;
    blockNumber: string;
    transactionHash: string;
  }[];
  disputes: {
    _arbitrator: string;
    _disputeID: string;
    blockNumber: string;
    blockTimestamp: string;
    _metaEvidenceID: string;
    _evidenceGroupID: string;
    transactionHash: string;
  }[];
  hasToPayFees: {
    _transactionID: string;
    blockNumber: string;
    blockTimestamp: string;
    _party: string;
    transactionHash: string;
  }[];
  rulings: {
    _arbitrator: string;
    _disputeID: string;
    blockNumber: string;
    blockTimestamp: string;
    _ruling: string;
    transactionHash: string;
  }[];
}

export interface ProcessedTransaction {
  id: string;
  timestamp: Date;
  title: string;
  description: string;
  amount: string;
  category: string;
  sender: string;
  receiver: string;
  transactionHash: string;
  blockNumber: string;
  status?: 'pending' | 'completed' | 'disputed' | 'unknown';
}

// Safe IPFS Loading
export const safeLoadIPFS = async (uri: string) => {
  try {
    return await klerosClient.services.ipfs.fetchFromIPFS(uri);
  } catch (error) {
    console.error(`Failed to load IPFS content for ${uri}:`, error);
    return {
      title: 'Failed to load',
      description: 'Content unavailable',
      category: 'Unknown',
      amount: '0',
      sender: 'Unknown',
      receiver: 'Unknown',
    };
  }
};

// Utility function to determine transaction status
export const getTransactionStatus = (events: TransactionEvents): 'pending' | 'completed' | 'disputed' | 'unknown' => {
  if (events.rulings && events.rulings.length > 0) {
    return 'completed';
  }
  
  if (events.disputes && events.disputes.length > 0) {
    return 'disputed';
  }
  
  if (events.payments && events.payments.length > 0) {
    return 'completed';
  }
  
  return 'pending';
};

// Utility function to format addresses
export const formatAddress = (address: string): string => {
  if (!address || address === 'Unknown') return 'Unknown';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Utility function to format ETH amounts
export const formatAmount = (amount: string): string => {
  if (!amount || amount === '0') return '0 ETH';
  try {
    return `${ethers.utils.formatEther(amount)} ETH`;
  } catch (e) {
    return `${amount} ETH`;
  }
};
