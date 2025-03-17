
import { useNavigate } from 'react-router-dom';

const TransactionDetailHeader = () => {
  const navigate = useNavigate();
  
  return (
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
  );
};

export default TransactionDetailHeader;
