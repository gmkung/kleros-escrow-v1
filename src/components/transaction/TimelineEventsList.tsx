
import React from 'react';
import TimelineEvent from '../TimelineEvent';
import TimelineIcon from './TimelineIcon';
import { TimelineEvent as TimelineEventType } from './timelineUtils';

interface TimelineEventsListProps {
  events: TimelineEventType[];
}

const TimelineEventsList: React.FC<TimelineEventsListProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return <div className="text-violet-300/70 p-4">No timeline events available.</div>;
  }

  return (
    <div className="pl-2">
      {events.map((event, index) => (
        <TimelineEvent 
          key={`${event.type}-${index}`}
          title={event.title}
          description={event.description}
          timestamp={event.timestamp}
          transactionHash={event.transactionHash}
          isLast={index === events.length - 1}
          icon={<TimelineIcon type={event.type} />}
        />
      ))}
    </div>
  );
};

export default TimelineEventsList;
