
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

  return (
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
              {transaction.aliases && transaction.aliases[transaction.sender] && 
                <span className="ml-2 text-neutral-500 text-sm">({transaction.aliases[transaction.sender]})</span>
              }
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
              {transaction.aliases && transaction.aliases[transaction.receiver] && 
                <span className="ml-2 text-neutral-500 text-sm">({transaction.aliases[transaction.receiver]})</span>
              }
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;
