import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  ProcessedTransaction,
  klerosClient,
  tokenClient,
  safeLoadIPFS,
} from "../lib/kleros";
import { sortByDate } from "../lib/utils";
import { mapTransactionStatus } from "../lib/kleros/utils";

export const useTransactions = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<ProcessedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setTransactions([]);
      setProcessedCount(0);
      setFailedCount(0);
      console.log("Fetching transactions...");

      // Fetch all transactions from both ETH and Token subgraphs
      const [ethTx, tokenTx] = await Promise.all([
        klerosClient.getAllEthMetaEvidence(),
        tokenClient.services.tokenEvent.getAllTokenMetaEvidence()
      ]);
      console.log("Received ETH transactions:", ethTx);
      console.log("Received Token transactions:", tokenTx);
      
      // Filter out any null or undefined transactions and add type
      const validEthTx = ethTx.filter(tx => tx && tx._metaEvidenceID).map(tx => ({ ...tx, type: 'ETH' }));
      const validTokenTx = tokenTx.filter(tx => tx && tx._metaEvidenceID).map(tx => ({ ...tx, type: 'TOKEN' }));
      
      const allValidTx = [...validEthTx, ...validTokenTx];
      setTotalCount(allValidTx.length);

      // Process transactions in parallel with batching
      const batchSize = 50; // Process 50 transactions at a time
      const processedTransactions: ProcessedTransaction[] = [];
      
      for (let i = 0; i < allValidTx.length; i += batchSize) {
        const batch = allValidTx.slice(i, i + batchSize);
        const batchPromises = batch.map(async (tx) => {
          try {
            console.log("Processing transaction:", tx._metaEvidenceID, "Type:", tx.type);
            
            // Get transaction details based on type
            const transactionDetailsPromise = tx.type === 'ETH' 
              ? klerosClient.getEthTransaction(tx._metaEvidenceID)
              : tokenClient.getTokenTransaction(tx._metaEvidenceID);
            
            // Run metadata and transaction detail fetching in parallel
            const [metaData, transactionDetails] = await Promise.all([
              safeLoadIPFS(tx._evidence),
              transactionDetailsPromise
            ]);

            console.log("Transaction details:", transactionDetails);

            // Get token information from metaData
            let tokenInfo = null;
            if (metaData.token) {
              tokenInfo = {
                name: metaData.token.name,
                symbol: metaData.token.ticker,
                decimals: parseInt(metaData.token.decimals)
              };
            }

                          const processedTx: ProcessedTransaction = {
                id: tx._metaEvidenceID,
                timestamp: new Date(parseInt(tx.blockTimestamp) * 1000),
                title: metaData.title || "Untitled Transaction",
                description: metaData.description || "No description available",
                amount: metaData.amount || "0",
                category: metaData.category || "Uncategorized",
                sender: metaData.sender || transactionDetails.sender || "Unknown",
                receiver: metaData.receiver || transactionDetails.receiver || "Unknown",
                transactionHash: tx.transactionHash,
                blockNumber: tx.blockNumber,
                status: mapTransactionStatus(transactionDetails.status, transactionDetails.amount),
                type: tx.type as 'ETH' | 'TOKEN',
                ...(tokenInfo && { tokenInfo }),
                ...(metaData.token?.address && { tokenAddress: metaData.token.address }),
              };

            setProcessedCount(prev => prev + 1);
            return processedTx;
          } catch (err) {
            console.error("Error processing transaction:", err);
            setFailedCount(prev => prev + 1);
            return null;
          }
        });

        // Wait for the current batch to complete
        const batchResults = await Promise.all(batchPromises);
        processedTransactions.push(...batchResults.filter(tx => tx !== null) as ProcessedTransaction[]);
        
        // Update transactions state with the new batch
        setTransactions(sortByDate(processedTransactions));
      }

      setError(null);
    } catch (err: any) {
      console.error("Failed to load transactions:", err);
      setError("Failed to load transactions. Please try again later.");
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
    loadTransactions,
    totalCount,
    processedCount,
    failedCount,
  };
};
