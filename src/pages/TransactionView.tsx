
import Header from '../components/Header';
import TransactionDetail from '../components/TransactionDetail';

const TransactionView = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <TransactionDetail />
      </main>
      
      <footer className="bg-white border-t border-neutral-200 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-neutral-500">
            Powered by <a href="https://kleros.io" className="text-blue-600 hover:text-blue-700 transition-colors">Kleros Protocol</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TransactionView;
