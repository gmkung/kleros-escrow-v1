import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { klerosClient, tokenClient, safeLoadIPFS } from '../lib/kleros';
import { mapTransactionStatus } from '../lib/kleros/utils';
import { ethers } from 'ethers';

// Import refactored components
import TransactionDetailHeader from './transaction/TransactionDetailHeader';
import TransactionSummary from './transaction/TransactionSummary';
import ArbitrationDetails from './transaction/ArbitrationDetails';
import ParticipatingParties from './transaction/ParticipatingParties';
import TransactionTimeline from './transaction/TransactionTimeline';
import TransactionSkeleton from './transaction/TransactionSkeleton';
import ErrorState from './transaction/ErrorState';
import TransactionActions from './transaction/TransactionActions';
import EvidenceList from './transaction/EvidenceList';

const TransactionDetail = () => {
  const { toast } = useToast();
  const { type, id } = useParams<{ type: string; id: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<any>(null);
  const [transactionEvents, setTransactionEvents] = useState<any>(null);

  const loadTransactionDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Use transaction type from URL to determine which client to use
      const isTokenTransaction = type?.toLowerCase() === 'token';
      
      // Fetch meta evidence from the appropriate client
      const metaEvidenceList = isTokenTransaction
        ? await tokenClient.services.tokenEvent.getAllTokenMetaEvidence()
        : await klerosClient.getAllEthMetaEvidence();

      const transactionMetaEvidence = metaEvidenceList.find(tx => tx._metaEvidenceID === id);

      if (!transactionMetaEvidence) {
        throw new Error(`${isTokenTransaction ? 'Token' : 'ETH'} transaction not found with ID ${id}`);
      }

      const metaData = await safeLoadIPFS(transactionMetaEvidence._evidence);

      // Use appropriate client based on transaction type
      const transactionDetails = isTokenTransaction 
        ? await tokenClient.getTokenTransaction(id)
        : await klerosClient.getEthTransaction(id);
      
      const events = isTokenTransaction
        ? await tokenClient.getTokenTransactionDetails(id)
        : await klerosClient.getEthTransactionDetails(id);

      // Get token information from metaData
      let tokenInfo = null;
      if (metaData.token && metaData.token.address) {
        tokenInfo = {
          name: metaData.token.name,
          symbol: metaData.token.ticker,
          decimals: parseInt(metaData.token.decimals)
        };
      }

      // Handle amount based on transaction type
      let processedAmount;
      if (isTokenTransaction) {
        // For token transactions, amount is already in token's smallest unit
        processedAmount = transactionDetails.amount || '0';
      } else {
        // For ETH transactions, ensure amount is in Wei format
        try {
          // If amount is already in Wei (big number string), use it directly
          processedAmount = ethers.BigNumber.from(transactionDetails.amount || '0').toString();
        } catch (e) {
          // If amount is in ETH format, convert it to Wei
          try {
            processedAmount = ethers.utils.parseEther(transactionDetails.amount || '0').toString();
          } catch (e) {
            processedAmount = '0';
          }
        }
      }

      setTransaction({
        id,
        timestamp: new Date(parseInt(transactionMetaEvidence.blockTimestamp) * 1000),
        title: metaData.title || 'Untitled Transaction',
        description: metaData.description || 'No description available',
        amount: processedAmount, // Proper format for transaction type
        category: metaData.category || 'Uncategorized',
        sender: metaData.sender || transactionDetails.sender || 'Unknown',
        receiver: metaData.receiver || transactionDetails.receiver || 'Unknown',
        transactionHash: transactionMetaEvidence.transactionHash,
        blockNumber: transactionMetaEvidence.blockNumber,
        status: mapTransactionStatus(transactionDetails.status, processedAmount),
        type: isTokenTransaction ? 'TOKEN' : 'ETH',
        ...(tokenInfo && { tokenInfo }),
        ...(metaData.token?.address && { tokenAddress: metaData.token.address }),
        question: metaData.question || '',
        timeout: metaData.timeout || 0,
        rulingOptions: metaData.rulingOptions || { titles: [], descriptions: [] },
        aliases: metaData.aliases || {},
      });

      setTransactionEvents(events);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load transaction details:', err);
      setError(err.message || 'Failed to load transaction details');
      toast({
        title: "Error loading transaction",
        description: err.message || "Transaction details could not be loaded",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactionDetails();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <TransactionDetailHeader />
        <TransactionSkeleton />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="container mx-auto px-4">
        <TransactionDetailHeader />
        <ErrorState error={error} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TransactionDetailHeader />

      <div className="max-w-4xl mx-auto">
        <div className="card-tron rounded-2xl overflow-hidden mb-8 shadow-lg animate-fadeIn">
          <div className="p-6">
            <TransactionSummary transaction={transaction} />

            <TransactionActions
              transaction={transaction}
              transactionEvents={transactionEvents}
              onAction={loadTransactionDetails}
            />
          </div>
        </div>

        <div className="card-tron rounded-2xl overflow-hidden mb-8 shadow-lg">
          <div className="p-6">
            {transaction.question && (transaction.status === 'pending' || transaction.status === 'disputed') && (
              <ArbitrationDetails
                question={transaction.question}
                rulingOptions={transaction.rulingOptions}
              />
            )}

            <ParticipatingParties aliases={transaction.aliases} />

            {transactionEvents?.evidences && transactionEvents.evidences.length > 0 && (
              <EvidenceList evidences={transactionEvents.evidences} />
            )}
          </div>
        </div>

        <div className="card-tron rounded-2xl overflow-hidden shadow-lg">
          <div className="p-6">
            <TransactionTimeline
              transactionEvents={transactionEvents}
              transaction={transaction}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
