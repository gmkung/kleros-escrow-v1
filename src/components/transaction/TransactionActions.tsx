
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSignerClient, klerosClient, uploadEvidenceToIPFS } from '../../lib/kleros';
import { useToast } from "@/hooks/use-toast";
import EvidenceDialog, { EvidenceFormData } from './EvidenceDialog';

interface TransactionActionsProps {
  transaction: any;
  transactionEvents: any;
  onAction: () => void;
}

const TransactionActions = ({ transaction, transactionEvents, onAction }: TransactionActionsProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);

  // Helper function to check if wallet is connected and transaction is active
  const checkCanAct = () => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast({
        title: "Wallet Required",
        description: "Please connect an Ethereum wallet to perform this action",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  // Release funds to receiver
  const handleReleaseFunds = async () => {
    if (!checkCanAct()) return;
    
    try {
      setIsLoading('release');
      const signerClient = await createSignerClient();
      
      const tx = await signerClient.actions.transaction.pay({
        transactionId: transaction.id,
        amount: transaction.amount,
      });
      
      toast({
        title: "Transaction Submitted",
        description: "Your transaction to release funds has been submitted",
      });
      
      await tx.wait();
      
      toast({
        title: "Funds Released",
        description: "The funds have been successfully released to the receiver",
        variant: "default",
      });
      
      onAction();
    } catch (error: any) {
      console.error("Error releasing funds:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to release funds",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  // Reimburse funds to sender
  const handleReimburse = async () => {
    if (!checkCanAct()) return;
    
    try {
      setIsLoading('reimburse');
      const signerClient = await createSignerClient();
      
      const tx = await signerClient.actions.transaction.reimburse({
        transactionId: transaction.id,
        amount: transaction.amount,
      });
      
      toast({
        title: "Transaction Submitted",
        description: "Your transaction to reimburse funds has been submitted",
      });
      
      await tx.wait();
      
      toast({
        title: "Funds Reimbursed",
        description: "The funds have been successfully returned to the sender",
        variant: "default",
      });
      
      onAction();
    } catch (error: any) {
      console.error("Error reimbursing funds:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to reimburse funds",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  // Submit evidence
  const handleSubmitEvidence = async (data: EvidenceFormData) => {
    if (!checkCanAct()) return;
    
    try {
      setIsLoading('evidence');
      
      // Upload evidence to IPFS
      const evidenceURI = await uploadEvidenceToIPFS(
        data.title,
        data.description,
        data.file
      );
      
      // Submit evidence to blockchain
      const signerClient = await createSignerClient();
      const tx = await signerClient.actions.evidence.submitEvidence({
        transactionId: transaction.id,
        evidence: evidenceURI,
      });
      
      toast({
        title: "Evidence Submission",
        description: "Your evidence submission has been submitted to the blockchain",
      });
      
      await tx.wait();
      
      toast({
        title: "Evidence Submitted",
        description: "Your evidence has been successfully recorded on the blockchain",
        variant: "default",
      });
      
      setEvidenceDialogOpen(false);
      onAction();
    } catch (error: any) {
      console.error("Error submitting evidence:", error);
      toast({
        title: "Evidence Submission Failed",
        description: error.message || "Failed to submit evidence",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  // Pay arbitration fee as sender
  const handlePayArbitrationFeeSender = async () => {
    if (!checkCanAct()) return;
    
    try {
      setIsLoading('paySenderFee');
      const signerClient = await createSignerClient();
      
      // Get arbitration cost
      const arbitrationCost = await klerosClient.services.dispute.getArbitrationCost();
      
      const tx = await signerClient.actions.dispute.payArbitrationFeeBySender({
        transactionId: transaction.id,
        value: arbitrationCost,
      });
      
      toast({
        title: "Transaction Submitted",
        description: "Your transaction to pay arbitration fee has been submitted",
      });
      
      await tx.wait();
      
      toast({
        title: "Arbitration Fee Paid",
        description: "You have successfully paid the arbitration fee as the sender",
        variant: "default",
      });
      
      onAction();
    } catch (error: any) {
      console.error("Error paying arbitration fee:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to pay arbitration fee",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  // Pay arbitration fee as receiver
  const handlePayArbitrationFeeReceiver = async () => {
    if (!checkCanAct()) return;
    
    try {
      setIsLoading('payReceiverFee');
      const signerClient = await createSignerClient();
      
      // Get arbitration cost
      const arbitrationCost = await klerosClient.services.dispute.getArbitrationCost();
      
      const tx = await signerClient.actions.dispute.payArbitrationFeeByReceiver({
        transactionId: transaction.id,
        value: arbitrationCost,
      });
      
      toast({
        title: "Transaction Submitted",
        description: "Your transaction to pay arbitration fee has been submitted",
      });
      
      await tx.wait();
      
      toast({
        title: "Arbitration Fee Paid",
        description: "You have successfully paid the arbitration fee as the receiver",
        variant: "default",
      });
      
      onAction();
    } catch (error: any) {
      console.error("Error paying arbitration fee:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to pay arbitration fee",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  // Check if transaction is in a state where funds can be released
  const canReleaseFunds = transaction.status === 'pending';
  
  // Check if transaction is in dispute or pending
  const canStartDispute = transaction.status === 'pending';
  
  // Check if there are already disputes
  const hasDispute = transactionEvents?.disputes?.length > 0;

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Transaction Actions</CardTitle>
          <CardDescription>Available actions for this transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {canReleaseFunds && !hasDispute && (
              <>
                <Button 
                  onClick={handleReleaseFunds} 
                  disabled={isLoading !== null}
                  className="w-full"
                >
                  {isLoading === 'release' ? 'Processing...' : 'Release Funds to Receiver'}
                </Button>
                
                <Button 
                  onClick={handleReimburse} 
                  disabled={isLoading !== null}
                  variant="outline" 
                  className="w-full"
                >
                  {isLoading === 'reimburse' ? 'Processing...' : 'Reimburse Funds to Sender'}
                </Button>
              </>
            )}
            
            {canStartDispute && !hasDispute && (
              <>
                <Button 
                  onClick={handlePayArbitrationFeeSender} 
                  disabled={isLoading !== null}
                  variant="secondary" 
                  className="w-full"
                >
                  {isLoading === 'paySenderFee' ? 'Processing...' : 'Pay Arbitration Fee (as Sender)'}
                </Button>
                
                <Button 
                  onClick={handlePayArbitrationFeeReceiver} 
                  disabled={isLoading !== null}
                  variant="secondary" 
                  className="w-full"
                >
                  {isLoading === 'payReceiverFee' ? 'Processing...' : 'Pay Arbitration Fee (as Receiver)'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => setEvidenceDialogOpen(true)} 
            disabled={isLoading !== null}
            variant="outline" 
            className="w-full"
          >
            {isLoading === 'evidence' ? 'Processing...' : 'Submit Evidence'}
          </Button>
        </CardFooter>
      </Card>
      
      <EvidenceDialog
        isOpen={evidenceDialogOpen}
        onClose={() => setEvidenceDialogOpen(false)}
        onSubmit={handleSubmitEvidence}
        isLoading={isLoading === 'evidence'}
      />
    </>
  );
};

export default TransactionActions;
