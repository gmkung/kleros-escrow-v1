
import { Skeleton } from "@/components/ui/skeleton";

const TransactionSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3 mb-2" />
        <Skeleton className="h-6 w-1/2 mb-6" />
        
        <div className="card-tron p-5 rounded-xl mb-6">
          <Skeleton className="h-32" />
        </div>
        
        <div className="card-tron p-5 rounded-xl">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-10 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSkeleton;
