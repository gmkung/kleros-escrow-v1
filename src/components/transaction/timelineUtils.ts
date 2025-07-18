
import { formatAddress, formatAmount } from '../../lib/kleros/utils';

export interface TimelineEvent {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  transactionHash: string;
}

export const processTimelineEvents = (transactionEvents: any, transaction: any): TimelineEvent[] => {
  if (!transactionEvents) return [];
  
  const timelineEvents: TimelineEvent[] = [];
  
  // Transaction created event
  timelineEvents.push({
    type: 'create',
    title: "Transaction Created",
    description: `Escrow transaction created between ${formatAddress(transaction.sender)} and ${formatAddress(transaction.receiver)}`,
    timestamp: transaction.timestamp ? (transaction.timestamp.getTime() / 1000) + '' : Date.now() / 1000 + '',
    transactionHash: transaction.transactionHash || '',
  });
  
  // Payment events
  if (transactionEvents.payments && transactionEvents.payments.length > 0) {
    transactionEvents.payments.forEach((payment: any) => {
      timelineEvents.push({
        type: 'payment',
        title: "Payment Made",
        description: `${formatAmount(payment._amount || '0', transaction.tokenInfo?.decimals || 18)} ${transaction.type === 'TOKEN' ? transaction.tokenInfo?.symbol : 'ETH'} paid by ${formatAddress(payment._party)}`,
        timestamp: payment.blockTimestamp || Date.now() / 1000 + '',
        transactionHash: payment.transactionHash || '',
      });
    });
  }
  
  // Evidence events
  if (transactionEvents.evidences && transactionEvents.evidences.length > 0) {
    transactionEvents.evidences.forEach((evidence: any) => {
      timelineEvents.push({
        type: 'evidence',
        title: "Evidence Submitted",
        description: `Evidence submitted by ${formatAddress(evidence._party)}`,
        timestamp: evidence.blockNumber || Date.now() / 1000 + '',
        transactionHash: evidence.transactionHash || '',
      });
    });
  }
  
  // Dispute events
  if (transactionEvents.disputes && transactionEvents.disputes.length > 0) {
    transactionEvents.disputes.forEach((dispute: any) => {
      timelineEvents.push({
        type: 'dispute',
        title: "Dispute Created",
        description: "Transaction is now in dispute resolution",
        timestamp: dispute.blockTimestamp || Date.now() / 1000 + '',
        transactionHash: dispute.transactionHash || '',
      });
    });
  }
  
  // Fee events
  if (transactionEvents.hasToPayFees && transactionEvents.hasToPayFees.length > 0) {
    transactionEvents.hasToPayFees.forEach((fee: any) => {
      timelineEvents.push({
        type: 'fee',
        title: "Arbitration Fee Required",
        description: `${formatAddress(fee._party)} needs to pay arbitration fees`,
        timestamp: fee.blockTimestamp || Date.now() / 1000 + '',
        transactionHash: fee.transactionHash || '',
      });
    });
  }
  
  // Ruling events
  if (transactionEvents.rulings && transactionEvents.rulings.length > 0) {
    transactionEvents.rulings.forEach((ruling: any) => {
      const rulingNumber = ruling._ruling ? parseInt(ruling._ruling) : 0;
      timelineEvents.push({
        type: 'ruling',
        title: "Ruling Given",
        description: `Final ruling: ${
          transaction.rulingOptions?.titles?.[rulingNumber] || 
          `Ruling #${ruling._ruling}`
        }`,
        timestamp: ruling.blockTimestamp || Date.now() / 1000 + '',
        transactionHash: ruling.transactionHash || '',
      });
    });
  }
  
  // Final payment event (if it happened after ruling)
  if (transactionEvents.payments?.length > 0) {
    const lastPayment = transactionEvents.payments.slice(-1)[0];
    const lastRuling = transactionEvents.rulings?.slice(-1)[0];
    
    if (!lastRuling || 
       (lastPayment.blockTimestamp && lastRuling.blockTimestamp && 
        new Date(parseInt(lastPayment.blockTimestamp) * 1000) > 
        new Date(parseInt(lastRuling.blockTimestamp) * 1000))) {
      timelineEvents.push({
        type: 'final',
        title: "Final Payment",
        description: `${formatAmount(lastPayment._amount || '0', transaction.tokenInfo?.decimals || 18)} ${transaction.type === 'TOKEN' ? transaction.tokenInfo?.symbol : 'ETH'} transferred to recipient`,
        timestamp: lastPayment.blockTimestamp || Date.now() / 1000 + '',
        transactionHash: lastPayment.transactionHash || '',
      });
    }
  }
  
  // Sort timeline events by timestamp
  return timelineEvents.sort((a, b) => {
    return parseInt(a.timestamp) - parseInt(b.timestamp);
  });
};
