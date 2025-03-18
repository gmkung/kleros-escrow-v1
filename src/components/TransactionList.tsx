
import { useState, useEffect } from 'react';
import { searchTransactions } from '../lib/utils';
import SearchBar from './SearchBar';
import { useTransactions } from '../hooks/useTransactions';
import TransactionListSection from './transaction/TransactionListSection';
import PaginationControls from './transaction/PaginationControls';

const ITEMS_PER_PAGE = 20;

const TransactionList = () => {
  const { transactions, loading, error, loadTransactions } = useTransactions();
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(searchTransactions(transactions, searchTerm));
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
