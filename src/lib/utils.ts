
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ProcessedTransaction } from "./kleros";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Debounce function that includes a cancel method in its return type
export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): { 
  (...args: Parameters<T>): ReturnType<T>;
  cancel: () => void;
} {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  // Create the debounced function
  const debounced = function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      return func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
    return undefined as unknown as ReturnType<T>;
  };
  
  // Add the cancel method
  debounced.cancel = function() {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debounced;
}

// Format timestamp function to convert unix timestamp to Date
export function formatTimestamp(timestamp: string | number): Date {
  const timestampNumber = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
  return new Date(timestampNumber * 1000);
}

// Format date function to return a formatted date string
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Search function for transactions
export const searchTransactions = (transactions: ProcessedTransaction[], searchTerm: string): ProcessedTransaction[] => {
  const term = searchTerm.toLowerCase().trim();
  return transactions.filter(tx => 
    tx.title.toLowerCase().includes(term) || 
    tx.description.toLowerCase().includes(term) ||
    tx.id.toLowerCase().includes(term)
  );
};

// Sort transactions by date
export const sortByDate = (transactions: ProcessedTransaction[]): ProcessedTransaction[] => {
  return [...transactions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Filter transactions by category
export const filterByCategory = (transactions: ProcessedTransaction[], category: string): ProcessedTransaction[] => {
  return transactions.filter(tx => tx.category === category);
};
