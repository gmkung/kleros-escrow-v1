import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatTimestamp } from '../lib/utils';
import { ProcessedTransaction, formatAddress, formatAmount } from '../lib/kleros';
import StatusBadge from './StatusBadge';

interface TransactionCardProps {
  transaction: ProcessedTransaction;
  className?: string;
  delayAnimation?: boolean;
}

const TransactionCard = ({ 
  transaction, 
  className = '',
  delayAnimation = false
}: TransactionCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!cardRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-slideInUp');
              entry.target.classList.remove('opacity-0');
            }, delayAnimation ? 100 : 0);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(cardRef.current);
    
    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, [delayAnimation]);
  
  return (
    <Link 
      to={`/transaction/${transaction.type.toLowerCase()}/${transaction.id}`} 
      className={`block ${className}`}
    >
      <div 
        ref={cardRef}
        className="card-tron rounded-2xl overflow-hidden card-hover opacity-0 transition-all duration-300 stagger-item"
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <StatusBadge status={transaction.status || 'unknown'} />
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                transaction.type === 'TOKEN' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {transaction.type === 'TOKEN' ? 'TOKEN' : 'ETH'}
              </span>
            </div>
            <span className="text-xs text-violet-200/70">
              {formatDate(transaction.timestamp)}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold mb-2 text-violet-100 line-clamp-1 tron-glow-text">
            {transaction.title || 'Untitled Transaction'}
          </h3>
          
          <p className="text-sm text-violet-200/80 mb-2 line-clamp-2">
            {transaction.description || 'No description available'}
          </p>
          
          {transaction.type === 'TOKEN' && transaction.tokenInfo && (
            <div className="text-xs text-violet-300/70 mb-2">
              <span className="font-medium">{transaction.tokenInfo.name}</span>
              {transaction.tokenAddress && (
                <span className="ml-2 text-violet-400/60">
                  {formatAddress(transaction.tokenAddress)}
                </span>
              )}
            </div>
          )}
          
          <div className="flex justify-between items-center text-xs text-violet-300/70 mt-4">
            <div className="flex flex-col">
              <span className="mb-1">Amount</span>
              <span className="font-medium text-violet-100">
                <span className="text-violet-300/70 mr-1">
                  {transaction.type === 'TOKEN' ? transaction.tokenInfo?.symbol : 'Ξ'}
                </span>
                {transaction.amount}
              </span>
            </div>
            
            <div className="h-8 w-px bg-violet-500/20"></div>
            
            <div className="flex flex-col items-end">
              <span className="mb-1">Transaction ID</span>
              <span className="font-medium text-violet-100">{transaction.id}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-violet-900/20 border-t border-violet-500/20 py-3 px-5 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs text-violet-300/70 mb-1">Sender</span>
            <span className="text-xs font-medium text-violet-100">{formatAddress(transaction.sender)}</span>
          </div>
          
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-violet-400"
          >
            <path 
              d="M5 12H19M19 12L12 5M19 12L12 19" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          
          <div className="flex flex-col items-end">
            <span className="text-xs text-violet-300/70 mb-1">Receiver</span>
            <span className="text-xs font-medium text-violet-100">{formatAddress(transaction.receiver)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TransactionCard;
