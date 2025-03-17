
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ProcessedTransaction } from "./kleros";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format a date to a human-readable string
export function formatDate(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}

// Format a timestamp string to a date object
export function formatTimestamp(timestamp: string): Date {
  return new Date(parseInt(timestamp) * 1000);
}

// Sort and filter functions for transactions
export const sortByDate = (transactions: ProcessedTransaction[]): ProcessedTransaction[] => 
  [...transactions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

export const filterByCategory = (transactions: ProcessedTransaction[], category: string): ProcessedTransaction[] => 
  transactions.filter(tx => tx.category === category);

export const searchTransactions = (transactions: ProcessedTransaction[], term: string): ProcessedTransaction[] => 
  transactions.filter(tx => 
    tx.title.toLowerCase().includes(term.toLowerCase()) || 
    tx.description.toLowerCase().includes(term.toLowerCase()) ||
    tx.id.includes(term)
  );

// Debounce function for search
export function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    return new Promise(resolve => {
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
  };
}

// Create a load more function that simulates infinite scrolling
export const simulateInfiniteScroll = <T>(
  items: T[],
  currentCount: number,
  increment: number = 10
): T[] => {
  return items.slice(0, Math.min(currentCount + increment, items.length));
};
