
import { Suspense } from 'react';
import Header from '../components/Header';
import TransactionDetail from '../components/TransactionDetail';
import TransactionSkeleton from '../components/transaction/TransactionSkeleton';

const TransactionView = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 grid-pattern">
        <Suspense fallback={<TransactionSkeleton />}>
          <TransactionDetail />
        </Suspense>
      </main>
      
      <footer className="bg-tron-dark py-8 text-white/90 border-t border-violet-500/20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-violet-300/80">
            Powered by <a href="https://kleros.io" className="text-violet-300 hover:text-violet-200 transition-colors">Kleros Protocol</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TransactionView;
