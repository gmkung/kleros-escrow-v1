
import { cn } from '../lib/utils';

interface StatusBadgeProps {
  status: 'pending' | 'completed' | 'disputed' | 'unknown' | 'NoDispute';
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'status-badge-pending',
    icon: (
      <svg 
        width="12" 
        height="12" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="mr-1"
      >
        <path 
          d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  completed: {
    label: 'Completed',
    className: 'status-badge-completed',
    icon: (
      <svg 
        width="12" 
        height="12" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="mr-1"
      >
        <path 
          d="M9 12L11 14L15 10M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  disputed: {
    label: 'Disputed',
    className: 'status-badge-disputed',
    icon: (
      <svg 
        width="12" 
        height="12" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="mr-1"
      >
        <path 
          d="M12 9V12M12 16H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  unknown: {
    label: 'Unknown',
    className: 'bg-slate-800/60 text-slate-300 border border-slate-600/50',
    icon: (
      <svg 
        width="12" 
        height="12" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="mr-1"
      >
        <path 
          d="M8.22766 9C8.77678 7.83481 10.2584 7 12.0001 7C14.2092 7 16.0001 8.34315 16.0001 10C16.0001 11.3994 14.7224 12.5751 12.9943 12.9066C12.4519 13.0106 12.0001 13.4477 12.0001 14M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  // Adding NoDispute configuration but it won't be rendered
  NoDispute: {
    label: '',
    className: '',
    icon: null,
  },
};

const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  // Don't render the badge if status is NoDispute
  if (status === 'NoDispute') {
    return null;
  }
  
  const config = statusConfig[status];
  
  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default StatusBadge;
