import { useState, useEffect } from 'react';
import { searchTransactions } from '../lib/utils';
import SearchBar from './SearchBar';
import { useTransactions } from '../hooks/useTransactions';
import TransactionListSection from './transaction/TransactionListSection';
import PaginationControls from './transaction/PaginationControls';
import { Progress } from "@/components/ui/progress";

const ITEMS_PER_PAGE = 20;

const TransactionList = () => {
  const { transactions, loading, error, loadTransactions, totalCount, processedCount, failedCount } = useTransactions();
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Handle search and manual overrides
  useEffect(() => {
    let filtered = transactions;
    
    // Manual override: Hide TOKEN transaction 94
    filtered = filtered.filter(transaction => 
      !(transaction.type === 'TOKEN' && transaction.id === '47')
    );
    
    if (searchTerm.trim() === '') {
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(searchTransactions(filtered, searchTerm));
    }
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [searchTerm, transactions]);
  
  // Calculate pagination values
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  // Go to specific page
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <SearchBar 
        onSearch={setSearchTerm} 
        className="mb-8"
      />
      
      {loading && totalCount > 0 && (
        <div className="mb-8">
          <div className="flex justify-between text-sm text-violet-300/70 mb-2">
            <span>Loading transaction details...</span>
            <div className="flex gap-4">
              <span>Loaded: {processedCount} / {totalCount}</span>
              {failedCount > 0 && (
                <span className="text-red-400">Failed: {failedCount}</span>
              )}
            </div>
          </div>
          <Progress 
            value={(processedCount / totalCount) * 100} 
            className="h-2 bg-violet-900/20"
          />
        </div>
      )}
      
      <TransactionListSection 
        transactions={paginatedTransactions}
        loading={loading}
        error={error}
        searchTerm={searchTerm}
        onRetry={loadTransactions}
      />
      
      <PaginationControls 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
      />
    </div>
  );
};

export default TransactionList;
