
import React from 'react';
import TimelineEventsList from './TimelineEventsList';
import { processTimelineEvents } from './timelineUtils';

interface TransactionTimelineProps {
  transactionEvents: any;
  transaction: any;
}

const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ 
  transactionEvents, 
  transaction 
}) => {
  const timelineEvents = processTimelineEvents(transactionEvents, transaction);
  
  return (
    <div>
      <h2 className="text-xl font-bold text-violet-100 mb-6 tron-glow-text">Transaction Timeline</h2>
      <TimelineEventsList events={timelineEvents} />
    </div>
  );
};

export default TransactionTimeline;
