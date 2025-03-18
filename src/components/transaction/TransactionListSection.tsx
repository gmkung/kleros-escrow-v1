
import React from 'react';
import { ProcessedTransaction } from '../../lib/kleros';
import TransactionCard from '../TransactionCard';
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionListSectionProps {
  transactions: ProcessedTransaction[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  onRetry: () => void;
}

const TransactionListSection: React.FC<TransactionListSectionProps> = ({
  transactions,
  loading,
  error,
  searchTerm,
  onRetry
}) => {
  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="card-tron p-5 rounded-xl">
            <Skeleton className="h-16 w-full mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between items-center mt-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-700 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-neutral-800 mb-2">No transactions found</h3>
        <p className="text-neutral-600">
          {searchTerm
            ? `No transactions match your search for "${searchTerm}"`
            : "There are no transactions available yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-8">
      {transactions.map((tx, index) => (
        <TransactionCard 
          key={tx.id} 
          transaction={tx} 
          delayAnimation={index > 3}
        />
      ))}
    </div>
  );
};

export default TransactionListSection;
