import { Token } from '../tokens';

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
    type?: string;
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
  token?: {
    name: string;
    ticker: string;
    symbolURI?: string;
    address: string | null;
    decimals: number;
  };
  evidenceDisplayInterfaceURI?: string;
  extraData?: Record<string, string>;
  aliases?: Record<string, string>;
  invoice?: boolean;
  arbitrableAddress?: string;
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

export interface CreateTransactionParams {
  receiver: string;
  value: string;
  timeoutPayment: number;
  metaEvidence: string;
  // Add token support
  token?: Token;
}

export interface CreateTransactionFormData {
  title: string;
  description: string;
  category: string;
  amount: string;
  receiverAddress: string;
  timeoutDays: string;
  fileURI?: string;
  file?: File;
  // Add token to form data
  token?: Token;
}

export interface EvidenceSubmissionParams {
  transactionId: string;
  evidence: string;
}
