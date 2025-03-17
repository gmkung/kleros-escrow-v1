
import Header from '../components/Header';
import TransactionList from '../components/TransactionList';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 md:py-16">
        <div className="max-w-5xl mx-auto px-4 mb-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Kleros Escrow Transaction Explorer
            </h1>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Browse and search through escrow transactions processed through the Kleros arbitration protocol.
              View transaction details, status, and timeline.
            </p>
          </div>
        </div>
        
        <TransactionList />
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

export default Index;
