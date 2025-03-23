import { ethers } from 'ethers';

// Function to format currency
export const formatAmount = (amount: string | number, decimals: number = 18): string => {
  try {
    // Check if amount is already in decimal format (like "1.3")
    if (typeof amount === 'string' && amount.includes('.')) {
      return amount;
    }
    
    const formattedAmount = ethers.utils.formatUnits(amount.toString(), decimals);
    return formattedAmount;
  } catch (error) {
    console.error("Error formatting amount:", error);
    return amount?.toString() || '0';
  }
};

// Function to shorten an Ethereum address
export const formatAddress = (address: string | undefined | null): string => {
  if (!address || typeof address !== 'string') return 'Unknown';
  return address.slice(0, 6) + '...' + address.slice(-4);
};

// Function to search transactions by title or description
export const searchTransactions = (transactions: any[], searchTerm: string) => {
  if (!searchTerm) {
    return transactions;
  }
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return transactions.filter(transaction => {
    const title = transaction.title ? transaction.title.toLowerCase() : '';
    const description = transaction.description ? transaction.description.toLowerCase() : '';
    
    return title.includes(lowerSearchTerm) || description.includes(lowerSearchTerm);
  });
};

// Function to sort transactions by date
export const sortByDate = (transactions: any[]) => {
  return [...transactions].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
};

// Get transaction status from events
export const getTransactionStatus = (events: any) => {
  // Check for rulings first (highest priority)
  if (events?.rulings?.length > 0) {
    return 'Resolved';
  }
  
  // Check for disputes next
  if (events?.disputes?.length > 0) {
    return 'DisputeCreated';
  }
  
  // Default status if no specific events found
  return 'NoDispute';
};

// Convert backend status to UI status
export const mapTransactionStatus = (backendStatus: string, amount?: string): 'pending' | 'completed' | 'disputed' | 'unknown' => {
  switch (backendStatus) {
    case 'Resolved':
      return 'completed';
    case 'DisputeCreated':
      return 'disputed';
    case 'WaitingSender':
    case 'WaitingReceiver':
      return 'pending';
    case 'NoDispute':
      // Check if the transaction has been paid (amount is 0)
      return amount === "0" ? "completed" : "pending";
    default:
      return 'unknown';
  }
};
