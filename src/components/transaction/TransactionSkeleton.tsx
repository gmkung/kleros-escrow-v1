
const TransactionSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-neutral-200 rounded w-1/3 mb-4"></div>
        <div className="h-6 bg-neutral-200 rounded w-1/2 mb-8"></div>
        <div className="h-32 bg-neutral-200 rounded mb-6"></div>
        <div className="h-64 bg-neutral-200 rounded"></div>
      </div>
    </div>
  );
};

export default TransactionSkeleton;
