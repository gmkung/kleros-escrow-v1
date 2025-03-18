
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
      
      <main className="flex-1 py-8 md:py-16 grid-pattern">
        <div className="max-w-5xl mx-auto px-4 mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div className="glass card-tron p-6 rounded-xl border border-violet-500/30 animate-pulse-glow">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 neon-text bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-300">
                Kleros Escrow
              </h1>
              <p className="text-violet-100/90 max-w-2xl">
                Browse and search through escrow transactions processed through the Kleros arbitration protocol.
                View transaction details, status, and timeline.
              </p>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="shrink-0 btn-tron rounded-md"
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
      
      <footer className="bg-tron-dark py-8 text-white/90 border-t border-violet-500/20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-violet-300/80">
            Powered by <a href="https://kleros.io" className="text-violet-300 hover:text-violet-200 transition-colors">Kleros Protocol</a> · <span className="text-violet-300/60">v1 · Ethereum Mainnet</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
