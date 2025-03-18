import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ProcessedTransaction, klerosClient, safeLoadIPFS } from '../lib/kleros';
import { searchTransactions, sortByDate, filterByCategory } from '../lib/utils';
import TransactionCard from './TransactionCard';
import SearchBar from './SearchBar';
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 20;

const TransactionList = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<ProcessedTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<ProcessedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching transactions...");
      
      // Fetch all transactions from the Kleros subgraph
      const allTx = await klerosClient.services.event.getAllMetaEvidence();
      console.log("Received transactions:", allTx);
      
      // Process the transactions with their metadata from IPFS
      const processedTx = await Promise.all(
        allTx.map(async (tx) => {
          try {
            console.log("Processing transaction:", tx._metaEvidenceID);
            const metaData = await safeLoadIPFS(tx._evidence);
            console.log("Metadata loaded:", metaData);
            
            // Get transaction details to determine status
            const details = await klerosClient.services.event.getTransactionDetails(tx._metaEvidenceID);
            console.log("Transaction details:", details);
            
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
      console.log("Valid transactions:", validTransactions);
      
      // Sort by date (newest first)
      const sortedTransactions = sortByDate(validTransactions);
      
      setTransactions(sortedTransactions);
      setFilteredTransactions(sortedTransactions);
      setError(null);
    } catch (err: any) {
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
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If there are fewer pages than maxPagesToShow, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, current page, and pages around current
      if (currentPage <= 3) {
        // If current page is near the start
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(null); // Ellipsis
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // If current page is near the end
        pages.push(1);
        pages.push(null); // Ellipsis
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // If current page is in the middle
        pages.push(1);
        pages.push(null); // Ellipsis
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push(null); // Ellipsis
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <SearchBar 
        onSearch={setSearchTerm} 
        className="mb-8"
      />
      
      {loading && filteredTransactions.length === 0 ? (
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
        <>
          <div className="space-y-4 mb-8">
            {paginatedTransactions.map((tx, index) => (
              <TransactionCard 
                key={tx.id} 
                transaction={tx} 
                delayAnimation={index > 3}
              />
            ))}
          </div>
          
          {totalPages > 1 && (
            <Pagination className="mb-12">
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => goToPage(currentPage - 1)}
                      className="cursor-pointer bg-tron-dark/80 text-violet-200 hover:bg-violet-900/40 hover:text-violet-100 border-violet-700/30"
                    />
                  </PaginationItem>
                )}
                
                {getPageNumbers().map((page, i) => (
                  page === null ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationLink
                        className="cursor-default bg-transparent text-violet-300"
                      >
                        ...
                      </PaginationLink>
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={`page-${page}`}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => goToPage(page as number)}
                        className={`cursor-pointer ${page === currentPage
                          ? 'bg-violet-600/70 text-violet-100 border-violet-500'
                          : 'bg-tron-dark/80 text-violet-300 hover:bg-violet-900/40 hover:text-violet-100 border-violet-700/30'
                        }`}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                ))}
                
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => goToPage(currentPage + 1)}
                      className="cursor-pointer bg-tron-dark/80 text-violet-200 hover:bg-violet-900/40 hover:text-violet-100 border-violet-700/30"
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default TransactionList;
