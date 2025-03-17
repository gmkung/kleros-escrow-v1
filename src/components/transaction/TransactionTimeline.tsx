
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
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-card">
      <div className="p-6">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">Transaction Timeline</h2>
        <TimelineEventsList events={timelineEvents} />
      </div>
    </div>
  );
};

export default TransactionTimeline;
