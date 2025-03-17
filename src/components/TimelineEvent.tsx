
import { formatTimestamp } from '../lib/utils';

interface TimelineEventProps {
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  isLast?: boolean;
  transactionHash?: string;
}

const TimelineEvent = ({ 
  title, 
  description, 
  timestamp, 
  icon, 
  isLast = false,
  transactionHash
}: TimelineEventProps) => {
  const formattedDate = formatTimestamp(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  const formattedTime = formatTimestamp(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const defaultIcon = (
    <svg 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
  
  return (
    <div className="flex gap-4 animate-fadeIn animate-once animate-delayed">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
          {icon || defaultIcon}
        </div>
        {!isLast && <div className="w-0.5 bg-neutral-200 h-full mt-2"></div>}
      </div>
      
      <div className={`pb-8 ${isLast ? '' : ''}`}>
        <div className="flex flex-col">
          <h4 className="text-base font-medium text-neutral-900">{title}</h4>
          
          <div className="flex items-center text-xs text-neutral-500 mt-1 mb-2">
            <span>{formattedDate}</span>
            <span className="mx-1.5">•</span>
            <span>{formattedTime}</span>
          </div>
          
          {description && (
            <p className="text-sm text-neutral-600 mt-1 mb-2">{description}</p>
          )}
          
          {transactionHash && (
            <a
              href={`https://etherscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 transition-colors mt-1"
            >
              <span>View on Etherscan</span>
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="ml-1"
              >
                <path 
                  d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineEvent;
