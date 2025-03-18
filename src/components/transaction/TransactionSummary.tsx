import StatusBadge from '../StatusBadge';
import { formatAmount, formatAddress } from '../../lib/kleros';

interface TransactionSummaryProps {
  transaction: any;
}

const TransactionSummary = ({ transaction }: TransactionSummaryProps) => {
  const formatDescription = (text: string) => {
    if (!text) return null;
    
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      const lines = paragraph.split('\n');
      
      if (lines.length === 1) {
        return <p key={`p-${index}`} className="mb-4 text-violet-200/80">{paragraph}</p>;
      }
      
      return (
        <p key={`p-${index}`} className="mb-4 text-violet-200/80">
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

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        {/* Ensure the status badge is displayed with the proper status */}
        <StatusBadge status={transaction.status} />
        <span className="text-sm text-violet-300/70">
          Transaction ID: {transaction.id}
        </span>
      </div>
      
      <h1 className="text-2xl font-bold text-violet-100 mb-2 tron-glow-text">
        {transaction.title}
      </h1>
      
      <div className="text-violet-200/80 mb-6 prose prose-sm max-w-none">
        {formatDescription(transaction.description)}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-violet-900/20 border border-violet-500/20 rounded-xl p-4">
          <h3 className="text-sm text-violet-300/70 mb-1">Amount</h3>
          <p className="text-lg font-semibold text-violet-100">{formatAmount(transaction.amount)}</p>
        </div>
        
        <div className="bg-violet-900/20 border border-violet-500/20 rounded-xl p-4">
          <h3 className="text-sm text-violet-300/70 mb-1">Sender</h3>
          <a 
            href={`https://etherscan.io/address/${transaction.sender}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-violet-300 hover:text-violet-200 transition-colors"
          >
            {formatAddress(transaction.sender)}
            {transaction.aliases && transaction.aliases[transaction.sender] && 
              <span className="ml-2 text-violet-400/70 text-sm">({transaction.aliases[transaction.sender]})</span>
            }
          </a>
        </div>
        
        <div className="bg-violet-900/20 border border-violet-500/20 rounded-xl p-4">
          <h3 className="text-sm text-violet-300/70 mb-1">Receiver</h3>
          <a 
            href={`https://etherscan.io/address/${transaction.receiver}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-violet-300 hover:text-violet-200 transition-colors"
          >
            {formatAddress(transaction.receiver)}
            {transaction.aliases && transaction.aliases[transaction.receiver] && 
              <span className="ml-2 text-violet-400/70 text-sm">({transaction.aliases[transaction.receiver]})</span>
            }
          </a>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;
