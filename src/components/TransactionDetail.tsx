
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { klerosClient, safeLoadIPFS, getTransactionStatus } from '../lib/kleros';

// Import refactored components
import TransactionDetailHeader from './transaction/TransactionDetailHeader';
import TransactionSummary from './transaction/TransactionSummary';
import ArbitrationDetails from './transaction/ArbitrationDetails';
import ParticipatingParties from './transaction/ParticipatingParties';
import TransactionTimeline from './transaction/TransactionTimeline';
import TransactionSkeleton from './transaction/TransactionSkeleton';
import ErrorState from './transaction/ErrorState';

const TransactionDetail = () => {
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<any>(null);
  const [transactionEvents, setTransactionEvents] = useState<any>(null);
  
  useEffect(() => {
    const loadTransactionDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const allTx = await klerosClient.services.event.getAllMetaEvidence();
        const transactionMetaEvidence = allTx.find(tx => tx._metaEvidenceID === id);
        
        if (!transactionMetaEvidence) {
          throw new Error('Transaction not found');
        }
        
        const metaData = await safeLoadIPFS(transactionMetaEvidence._evidence);
        
        const events = await klerosClient.services.event.getTransactionDetails(id);
        
        setTransaction({
          id,
          timestamp: new Date(parseInt(transactionMetaEvidence.blockTimestamp) * 1000),
          title: metaData.title || 'Untitled Transaction',
          description: metaData.description || 'No description available',
          amount: metaData.amount || '0',
          category: metaData.category || 'Uncategorized',
          sender: metaData.sender || 'Unknown',
          receiver: metaData.receiver || 'Unknown',
          transactionHash: transactionMetaEvidence.transactionHash,
          blockNumber: transactionMetaEvidence.blockNumber,
          status: getTransactionStatus(events),
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
    
    loadTransactionDetails();
  }, [id, toast]);
  
  if (loading) {
    return <TransactionSkeleton />;
  }
  
  if (error || !transaction) {
    return <ErrorState error={error} />;
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <TransactionDetailHeader />
      
      <TransactionSummary transaction={transaction} />
      
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden mb-8 shadow-card">
        <div className="p-6">
          {transaction.question && (
            <ArbitrationDetails 
              question={transaction.question} 
              rulingOptions={transaction.rulingOptions} 
            />
          )}
          
          <ParticipatingParties aliases={transaction.aliases} />
        </div>
      </div>
      
      <TransactionTimeline 
        transactionEvents={transactionEvents} 
        transaction={transaction}
      />
    </div>
  );
};

export default TransactionDetail;
