import { useState } from 'react';

import TransactionList from '../components/TransactionList';
import CreateTransactionDialog from '../components/transaction/CreateTransactionDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Index = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">


      <main className="flex-1 py-8 md:py-16 grid-pattern">
        <div className="max-w-5xl mx-auto px-4 mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div className="glass card-tron p-6 rounded-xl border border-violet-500/30 animate-pulse-glow">
              <h1 className="font-bold mb-4 flex flex-col">
                <span className="text-3xl md:text-4xl neon-text bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-300">
                  Escrowly
                </span>
              </h1>
              <div className="space-y-4">
                <p className="text-violet-100/90 max-w-2xl">
                  Create, search and manage trustless escrow transactions secured by the Kleros arbitration protocol.
                </p>
                <p className="text-[10px] text-violet-300/50 max-w-2xl italic">
                  This is a community-created interface. Use at your own risk. Not officially affiliated with Kleros.
                </p>
              </div>
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
        <div className="max-w-5xl mx-auto px-4 text-center space-y-2">
          <p className="text-sm text-violet-300/80">
            Powered by <a href="https://kleros.io" className="text-violet-300 hover:text-violet-200 transition-colors">Kleros</a> · <span className="text-violet-300/60">v1 · Ethereum Mainnet</span>
          </p>
          <p className="text-xs text-violet-300/40">
            Community-created interface. Use at your own risk. Not affiliated with Kleros.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
