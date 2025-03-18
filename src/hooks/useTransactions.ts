
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ProcessedTransaction, klerosClient, safeLoadIPFS } from '../lib/kleros';
import { sortByDate } from '../lib/utils';

export const useTransactions = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<ProcessedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            
            // Get transaction details using services.transaction.getTransaction
            const transactionDetails = await klerosClient.services.transaction.getTransaction(tx._metaEvidenceID);
            console.log("Transaction details:", transactionDetails);
            
            let status: 'pending' | 'completed' | 'disputed' | 'unknown' = 'pending';
            
            // Determine status based on the transaction status
            switch (transactionDetails.status) {
              case 'Resolved':
                status = 'completed';
                break;
              case 'DisputeCreated':
                status = 'disputed';
                break;
              case 'WaitingSender':
              case 'WaitingReceiver':
              case 'NoDispute':
                status = 'pending';
                break;
              default:
                status = 'unknown';
                break;
            }
            
            return {
              id: tx._metaEvidenceID,
              timestamp: new Date(parseInt(tx.blockTimestamp) * 1000),
              title: metaData.title || 'Untitled Transaction',
              description: metaData.description || 'No description available',
              amount: metaData.amount || '0',
              category: metaData.category || 'Uncategorized',
              sender: metaData.sender || transactionDetails.sender || 'Unknown',
              receiver: metaData.receiver || transactionDetails.receiver || 'Unknown',
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

  return {
    transactions,
    loading,
    error,
    loadTransactions
  };
};
