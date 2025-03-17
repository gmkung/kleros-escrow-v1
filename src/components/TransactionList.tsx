
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ProcessedTransaction, klerosClient, safeLoadIPFS } from '../lib/kleros';
import { searchTransactions, sortByDate, filterByCategory } from '../lib/utils';
import TransactionCard from './TransactionCard';
import SearchBar from './SearchBar';

const TransactionList = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<ProcessedTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<ProcessedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all transactions from the Kleros subgraph
      const allTx = await klerosClient.services.event.getAllMetaEvidence();
      
      // Process the transactions with their metadata from IPFS
      const processedTx = await Promise.all(
        allTx.map(async (tx) => {
          try {
            const metaData = await safeLoadIPFS(tx._evidence);
            
            // Get transaction details to determine status
            const details = await klerosClient.services.event.getTransactionDetails(tx._metaEvidenceID);
            
            let status: 'pending' | 'completed' | 'disputed' | 'unknown' = 'pending';
            
            if (details.rulings && details.rulings.length > 0) {
              status = 'completed';
            } else if (details.disputes && details.disputes.length > 0) {
              status = 'disputed';
            } else if (details.payments && details.payments.length > 0) {
              status = 'completed';
            }
            
            return {
              id: tx._metaEvidenceID,
              timestamp: new Date(parseInt(tx.blockTimestamp) * 1000),
              title: metaData.title || 'Untitled Transaction',
              description: metaData.description || 'No description available',
              amount: metaData.amount || '0',
              category: metaData.category || 'Uncategorized',
              sender: metaData.sender || 'Unknown',
              receiver: metaData.receiver || 'Unknown',
              transactionHash: tx.transactionHash,
              blockNumber: tx.blockNumber,
              status
            };
          } catch (err) {
            console.error('Error processing transaction:', err);
            return null;
          }
        })
      );
      
      // Filter out any null values from failed processing
      const validTransactions = processedTx.filter(tx => tx !== null) as ProcessedTransaction[];
      
      // Sort by date (newest first)
      const sortedTransactions = sortByDate(validTransactions);
      
      setTransactions(sortedTransactions);
      setFilteredTransactions(sortedTransactions);
      setError(null);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError('Failed to load transactions. Please try again later.');
      toast({
        title: "Error loading transactions",
        description: "Please try again later or check your connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);
  
  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(searchTransactions(transactions, searchTerm));
    }
    // Reset visible count when search changes
    setVisibleCount(10);
  }, [searchTerm, transactions]);
  
  // Load more transactions on scroll
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 500
    ) {
      setVisibleCount(prev => Math.min(prev + 10, filteredTransactions.length));
    }
  }, [filteredTransactions.length]);
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <SearchBar 
        onSearch={setSearchTerm} 
        className="mb-8"
      />
      
      {loading && filteredTransactions.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl border border-neutral-200 overflow-hidden h-60 animate-pulse"
            ></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-neutral-700 mb-4">{error}</p>
          <button
            onClick={() => loadTransactions()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-neutral-800 mb-2">No transactions found</h3>
          <p className="text-neutral-600">
            {searchTerm
              ? `No transactions match your search for "${searchTerm}"`
              : "There are no transactions available yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.slice(0, visibleCount).map((tx, index) => (
            <TransactionCard 
              key={tx.id} 
              transaction={tx} 
              delayAnimation={index > 3}
            />
          ))}
          
          {visibleCount < filteredTransactions.length && (
            <div className="text-center py-8">
              <div className="w-8 h-8 rounded-full bg-neutral-200 animate-pulse mx-auto"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionList;
