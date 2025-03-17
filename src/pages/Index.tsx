
import { useState } from 'react';
import Header from '../components/Header';
import TransactionList from '../components/TransactionList';
import CreateTransactionDialog from '../components/transaction/CreateTransactionDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Index = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 md:py-16 bg-gradient-to-br from-[#f8f4ff] to-[#efe7ff]">
        <div className="max-w-5xl mx-auto px-4 mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div className="backdrop-blur-sm p-6 rounded-xl bg-white/50 border border-purple-100/80 shadow-sm">
              <h1 className="text-3xl md:text-4xl font-bold text-[#4a148c] mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-purple-600">
                Kleros Escrow Transaction Explorer
              </h1>
              <p className="text-neutral-700 max-w-2xl">
                Browse and search through escrow transactions processed through the Kleros arbitration protocol.
                View transaction details, status, and timeline.
              </p>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="shrink-0 btn-industrial"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              New Transaction
            </Button>
          </div>
        </div>
        
        <TransactionList />

        <CreateTransactionDialog 
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
        />
      </main>
      
      <footer className="bg-metallic-dark py-8 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-purple-100">
            Powered by <a href="https://kleros.io" className="text-purple-300 hover:text-purple-200 transition-colors">Kleros Protocol</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
