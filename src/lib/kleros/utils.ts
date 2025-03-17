
import { ethers } from "ethers";
import { TransactionEvents } from "./types";

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
