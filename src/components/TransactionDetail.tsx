import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { klerosClient, safeLoadIPFS, formatAddress, formatAmount, getTransactionStatus } from '../lib/kleros';
import StatusBadge from './StatusBadge';
import TimelineEvent from './TimelineEvent';

const TransactionDetail = () => {
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
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
  
  const formatDescription = (text: string) => {
    if (!text) return null;
    
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      const lines = paragraph.split('\n');
      
      if (lines.length === 1) {
        return <p key={`p-${index}`} className="mb-4">{paragraph}</p>;
      }
      
      return (
        <p key={`p-${index}`} className="mb-4">
          {lines.map((line, lineIndex) => (
            <span key={`line-${index}-${lineIndex}`}>
              {line}
              {lineIndex < lines.length - 1 && <br />}
            </span>
          ))}
        </p>
      );
    });
  };
  
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-neutral-200 rounded w-1/2 mb-8"></div>
          <div className="h-32 bg-neutral-200 rounded mb-6"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error || !transaction) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">Transaction Not Found</h2>
        <p className="text-neutral-600 mb-6">{error || "The transaction you're looking for doesn't exist or has been removed."}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Back to Transactions
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900 transition-colors mb-6"
      >
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="mr-1"
        >
          <path 
            d="M19 12H5M5 12L12 19M5 12L12 5" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        Back to All Transactions
      </button>
      
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden mb-8 shadow-card">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <StatusBadge status={transaction.status} />
            <span className="text-sm text-neutral-500">
              Transaction ID: {transaction.id}
            </span>
          </div>
          
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            {transaction.title}
          </h1>
          
          <div className="text-neutral-600 mb-6 prose prose-sm max-w-none">
            {formatDescription(transaction.description)}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-neutral-50 rounded-xl p-4">
              <h3 className="text-sm text-neutral-500 mb-1">Amount</h3>
              <p className="text-lg font-semibold text-neutral-900">{formatAmount(transaction.amount)}</p>
            </div>
            
            <div className="bg-neutral-50 rounded-xl p-4">
              <h3 className="text-sm text-neutral-500 mb-1">Sender</h3>
              <a 
                href={`https://etherscan.io/address/${transaction.sender}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {formatAddress(transaction.sender)}
              </a>
            </div>
            
            <div className="bg-neutral-50 rounded-xl p-4">
              <h3 className="text-sm text-neutral-500 mb-1">Receiver</h3>
              <a 
                href={`https://etherscan.io/address/${transaction.receiver}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {formatAddress(transaction.receiver)}
              </a>
            </div>
          </div>
          
          {transaction.question && (
            <div className="mt-6 border-t border-neutral-200 pt-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Arbitration Question</h3>
              <p className="text-neutral-600">{transaction.question}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-card">
        <div className="p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">Transaction Timeline</h2>
          
          <div className="pl-2">
            <TimelineEvent 
              title="Transaction Created"
              description={`Escrow transaction created between ${formatAddress(transaction.sender)} and ${formatAddress(transaction.receiver)}`}
              timestamp={transaction.timestamp.getTime() / 1000 + ''}
              transactionHash={transaction.transactionHash}
              icon={
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M9 12H15M12 9V15M3 12C3 13.1819 3.23279 14.3522 3.68508 15.4442C4.13738 16.5361 4.80031 17.5282 5.63604 18.364C6.47177 19.1997 7.46392 19.8626 8.55585 20.3149C9.64778 20.7672 10.8181 21 12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 9.61305 20.0518 7.32387 18.364 5.63604C16.6761 3.94821 14.3869 3 12 3C9.61305 3 7.32387 3.94821 5.63604 5.63604C3.94821 7.32387 3 9.61305 3 12Z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
            
            {transactionEvents?.payments?.map((payment: any, index: number) => (
              <TimelineEvent 
                key={`payment-${index}`}
                title="Payment Made"
                description={`${formatAmount(payment._amount)} paid by ${formatAddress(payment._party)}`}
                timestamp={payment.blockTimestamp}
                transactionHash={payment.transactionHash}
                icon={
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
            ))}
            
            {transactionEvents?.evidences?.map((evidence: any, index: number) => (
              <TimelineEvent 
                key={`evidence-${index}`}
                title="Evidence Submitted"
                description={`Evidence submitted by ${formatAddress(evidence._party)}`}
                timestamp={evidence.blockNumber}
                transactionHash={evidence.transactionHash}
                icon={
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M9 12.0001L11 14.0001L15 10.0001M7 3.99999V2.99999C7 2.73477 7.10536 2.48042 7.29289 2.29288C7.48043 2.10535 7.73478 1.99999 8 1.99999H16C16.2652 1.99999 16.5196 2.10535 16.7071 2.29288C16.8946 2.48042 17 2.73477 17 2.99999V3.99999M12 14.0001V16.0001M10 22.0001H14C14.5304 22.0001 15.0391 21.7894 15.4142 21.4143C15.7893 21.0392 16 20.5305 16 20.0001V11.0001C16 10.4696 15.7893 9.96092 15.4142 9.58584C15.0391 9.21077 14.5304 9.00006 14 9.00006H10C9.46957 9.00006 8.96086 9.21077 8.58579 9.58584C8.21071 9.96092 8 10.4696 8 11.0001V20.0001C8 20.5305 8.21071 21.0392 8.58579 21.4143C8.96086 21.7894 9.46957 22.0001 10 22.0001Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
            ))}
            
            {transactionEvents?.disputes?.map((dispute: any, index: number) => (
              <TimelineEvent 
                key={`dispute-${index}`}
                title="Dispute Created"
                description="Transaction is now in dispute resolution"
                timestamp={dispute.blockTimestamp}
                transactionHash={dispute.transactionHash}
                icon={
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-red-600"
                  >
                    <path 
                      d="M12 9V12M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
            ))}
            
            {transactionEvents?.hasToPayFees?.map((fee: any, index: number) => (
              <TimelineEvent 
                key={`fee-${index}`}
                title="Arbitration Fee Required"
                description={`${formatAddress(fee._party)} needs to pay arbitration fees`}
                timestamp={fee.blockTimestamp}
                transactionHash={fee.transactionHash}
                icon={
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M12 8C10.8954 8 10 7.10457 10 6C10 4.89543 10.8954 4 12 4C13.1046 4 14 4.89543 14 6C14 7.10457 13.1046 8 12 8Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M12 20C10.8954 20 10 19.1046 10 18C10 16.8954 10.8954 16 12 16C13.1046 16 14 16.8954 14 18C14 19.1046 13.1046 20 12 20Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M18 14C19.1046 14 20 13.1046 20 12C20 10.8954 19.1046 10 18 10C16.8954 10 16 10.8954 16 12C16 13.1046 16.8954 14 18 14Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M6 14C7.10457 14 8 13.1046 8 12C8 10.8954 7.10457 10 6 10C4.89543 10 4 10.8954 4 12C4 13.1046 4.89543 14 6 14Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
            ))}
            
            {transactionEvents?.rulings?.map((ruling: any, index: number) => (
              <TimelineEvent 
                key={`ruling-${index}`}
                title="Ruling Given"
                description={`Final ruling: ${
                  transaction.rulingOptions?.titles?.[parseInt(ruling._ruling)] || 
                  `Ruling #${ruling._ruling}`
                }`}
                timestamp={ruling.blockTimestamp}
                transactionHash={ruling.transactionHash}
                isLast={
                  index === transactionEvents.rulings.length - 1 &&
                  !transactionEvents.payments?.slice(-1)[0]?.blockTimestamp > ruling.blockTimestamp
                }
                icon={
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-green-600"
                  >
                    <path 
                      d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
            ))}
            
            {transactionEvents?.payments?.length > 0 && 
              new Date(parseInt(transactionEvents.payments.slice(-1)[0].blockTimestamp) * 1000) > 
              (transactionEvents?.rulings?.length > 0 
                ? new Date(parseInt(transactionEvents.rulings.slice(-1)[0].blockTimestamp) * 1000)
                : new Date(0)) && (
              <TimelineEvent 
                key="final-payment"
                title="Final Payment"
                description={`${formatAmount(transactionEvents.payments.slice(-1)[0]._amount)} transferred to recipient`}
                timestamp={transactionEvents.payments.slice(-1)[0].blockTimestamp}
                transactionHash={transactionEvents.payments.slice(-1)[0].transactionHash}
                isLast={true}
                icon={
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-green-600"
                  >
                    <path 
                      d="M9 12L11 14L15 10M3 12C3 13.1819 3.23279 14.3522 3.68508 15.4442C4.13738 16.5361 4.80031 17.5282 5.63604 18.364C6.47177 19.1997 7.46392 19.8626 8.55585 20.3149C9.64778 20.7672 10.8181 21 12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 9.61305 20.0518 7.32387 18.364 5.63604C16.6761 3.94821 14.3869 3 12 3C9.61305 3 7.32387 3.94821 5.63604 5.63604C3.94821 7.32387 3 9.61305 3 12Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
