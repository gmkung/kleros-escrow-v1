
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
      
      <main className="flex-1 py-8 md:py-16">
        <div className="max-w-5xl mx-auto px-4 mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Kleros Escrow Transaction Explorer
              </h1>
              <p className="text-neutral-600 max-w-2xl">
                Browse and search through escrow transactions processed through the Kleros arbitration protocol.
                View transaction details, status, and timeline.
              </p>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="shrink-0"
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
