import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSignerClient, klerosClient, uploadEvidenceToIPFS } from '../../lib/kleros';
import { formatAmount } from '../../lib/kleros/utils';
import { useToast } from "@/hooks/use-toast";
import EvidenceDialog, { EvidenceFormData } from './EvidenceDialog';
import { useAccount, useConnect } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ethers } from 'ethers';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TransactionActionsProps {
  transaction: any;
  transactionEvents: any;
  onAction: () => void;
}

// Helper component for buttons with tooltips
interface ActionButtonProps {
  onClick: () => void;
  disabled: boolean;
  disabledReason?: string;
  variant?: "default" | "outline" | "secondary";
  className?: string;
  children: React.ReactNode;
}

const ActionButton = ({ onClick, disabled, disabledReason, variant, className, children }: ActionButtonProps) => {
  const button = (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      className={className}
    >
      {children}
    </Button>
  );

  if (disabled && disabledReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>{disabledReason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};

const TransactionActions = ({ transaction, transactionEvents, onAction }: TransactionActionsProps) => {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [arbitrationCost, setArbitrationCost] = useState<string | null>(null);
  const [releaseAmount, setReleaseAmount] = useState<string>('');
  const [reimburseAmount, setReimburseAmount] = useState<string>('');

  // Check if the current user is the sender or receiver
  const isSender = address?.toLowerCase() === transaction.sender?.toLowerCase();
  const isReceiver = address?.toLowerCase() === transaction.receiver?.toLowerCase();
  const isParticipant = isSender || isReceiver;

  // Check if transaction is in a state where funds can be released
  const canReleaseFunds = transaction.status === 'pending';

  // Check if transaction is in dispute or pending
  const canStartDispute = transaction.status === 'pending';

  // Check if there are already disputes
  const hasDispute = transactionEvents?.disputes?.length > 0;

  // Load arbitration cost only if connected and can start dispute
  useEffect(() => {
    const loadArbitrationCost = async () => {
      try {
        const cost = await klerosClient.services.dispute.getArbitrationCost();
        setArbitrationCost(cost);
      } catch (error) {
        console.error("Error fetching arbitration cost:", error);
      }
    };
    
    if (isConnected && canStartDispute && !hasDispute) {
      loadArbitrationCost();
    }
  }, [isConnected, canStartDispute, hasDispute]);

  // Helper function to check if wallet is connected
  const checkCanAct = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Connection Required",
        description: "Please connect your wallet to perform this action.",
      });
      connect({ connector: metaMask() });
      return false;
    }
    return true;
  };

  // Validate amount input
  const validateAmount = (value: string): boolean => {
    if (!value || isNaN(Number(value))) return false;
    try {
      // Use correct decimals based on transaction type
      const decimals = transaction.type === 'TOKEN' ? (transaction.tokenInfo?.decimals || 18) : 18;
      const amountWei = ethers.utils.parseUnits(value, decimals);
      const transactionAmountWei = ethers.BigNumber.from(transaction.amount);
      return amountWei.gt(0) && amountWei.lte(transactionAmountWei);
    } catch (e) {
      return false;
    }
  };

  // Release funds to receiver
  const handleReleaseFunds = async () => {
    if (!checkCanAct() || !isSender) return;

    try {
      setIsLoading('release');
      const signerClient = await createSignerClient();

      // Convert amount to proper units based on transaction type
      const decimals = transaction.type === 'TOKEN' ? (transaction.tokenInfo?.decimals || 18) : 18;
      const amountWei = ethers.utils.parseUnits(releaseAmount, decimals);
      const transactionAmountWei = ethers.BigNumber.from(transaction.amount);
      
      // Double check the amount
      if (amountWei.gt(transactionAmountWei)) {
        throw new Error("Amount exceeds available balance");
      }

      console.log("About to release funds:", {
        transactionId: transaction.id,
        amount: amountWei.toString()
      });

      // Use correct client based on transaction type
      const client = transaction.type === 'TOKEN' ? signerClient.tokenClient : signerClient.ethClient;
      const tx = await client.actions.transaction.pay({
        transactionId: transaction.id,
        amount: amountWei.toString(),
      });

      toast({
        title: "Transaction Submitted",
        description: "Your transaction to release funds has been submitted",
      });

      await tx.wait();

      toast({
        title: "Funds Released",
        description: `Successfully released ${releaseAmount} ETH to the receiver`,
        variant: "default",
      });

      setReleaseAmount('');
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
    if (!checkCanAct() || !isReceiver) return;

    try {
      setIsLoading('reimburse');
      const signerClient = await createSignerClient();

      // Convert amount to proper units based on transaction type
      const decimals = transaction.type === 'TOKEN' ? (transaction.tokenInfo?.decimals || 18) : 18;
      const amountWei = ethers.utils.parseUnits(reimburseAmount, decimals);
      const transactionAmountWei = ethers.BigNumber.from(transaction.amount);
      
      // Double check the amount
      if (amountWei.gt(transactionAmountWei)) {
        throw new Error("Amount exceeds available balance");
      }

      console.log("About to reimburse:", {
        transactionId: transaction.id,
        amount: amountWei.toString()
      });

      // Use correct client based on transaction type
      const client = transaction.type === 'TOKEN' ? signerClient.tokenClient : signerClient.ethClient;
      const tx = await client.actions.transaction.reimburse({
        transactionId: transaction.id,
        amount: amountWei.toString(),
      });

      toast({
        title: "Transaction Submitted",
        description: "Your transaction to reimburse funds has been submitted",
      });

      await tx.wait();

      toast({
        title: "Funds Reimbursed",
        description: `Successfully reimbursed ${reimburseAmount} ETH to the sender`,
        variant: "default",
      });

      setReimburseAmount('');
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
    if (!checkCanAct() || !isParticipant) return;

    try {
      setIsLoading('evidence');

      // Upload evidence to IPFS
      const evidenceURI = await uploadEvidenceToIPFS(
        data.title,
        data.description,
        data.file
      );

      console.log("Evidence URI received from uploadEvidenceToIPFS:", evidenceURI);

      // Get signer client
      const signerClient = await createSignerClient();

      // Debug: Check what methods are available
      console.log("Evidence client methods:", signerClient.ethClient.actions.evidence);

      // Submit evidence to blockchain
      const tx = await signerClient.ethClient.actions.evidence.submitEvidence({
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
    if (!checkCanAct() || !isSender) return;

    try {
      setIsLoading('paySenderFee');
      const signerClient = await createSignerClient();

      // Get arbitration cost (already in Wei)
      const arbitrationCost = await klerosClient.services.dispute.getArbitrationCost();

      console.log("About to pay arbitration fee as sender:", {
        transactionId: transaction.id,
        value: arbitrationCost // Keep in Wei
      });

      const tx = await signerClient.ethClient.actions.dispute.payArbitrationFeeBySender({
        transactionId: transaction.id,
        value: arbitrationCost // Keep in Wei
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
    if (!checkCanAct() || !isReceiver) return;

    try {
      setIsLoading('payReceiverFee');
      const signerClient = await createSignerClient();

      // Get arbitration cost (already in Wei)
      const arbitrationCost = await klerosClient.services.dispute.getArbitrationCost();

      console.log("About to pay arbitration fee as receiver:", {
        transactionId: transaction.id,
        value: arbitrationCost // Keep in Wei
      });

      const tx = await signerClient.ethClient.actions.dispute.payArbitrationFeeByReceiver({
        transactionId: transaction.id,
        value: arbitrationCost // Keep in Wei
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

  // Get disabled reasons for different actions
  const getReleaseFundsDisabledReason = () => {
    if (!isSender) return "Only the sender can release funds";
    if (hasDispute) return "Cannot release funds while dispute is active";
    if (transaction.status !== 'pending') return "Transaction is not in a pending state";
    if (isLoading) return "Action in progress";
    return undefined;
  };

  const getReimburseDisabledReason = () => {
    if (!isReceiver) return "Only the receiver can reimburse funds";
    if (hasDispute) return "Cannot reimburse funds while dispute is active";
    if (transaction.status !== 'pending') return "Transaction is not in a pending state";
    if (isLoading) return "Action in progress";
    return undefined;
  };

  const getArbitrationFeeDisabledReason = () => {
    if (hasDispute) return "Dispute has already been created";
    if (transaction.status !== 'pending') return "Transaction is not in a pending state";
    if (isLoading) return "Action in progress";
    return undefined;
  };

  const getEvidenceDisabledReason = () => {
    if (!isParticipant) return "Only transaction participants can submit evidence";
    if (isLoading) return "Action in progress";
    if (transaction.status === 'completed') return "Cannot submit evidence for completed transactions";
    return undefined;
  };

  // If wallet is not connected, show connect wallet prompt
  if (!isConnected) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Transaction Actions</CardTitle>
          <CardDescription>Connect your wallet to interact with this transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => connect({ connector: metaMask() })}
            className="w-full"
          >
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If connected but not a participant, show message
  if (!isParticipant) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Transaction Actions</CardTitle>
          <CardDescription>
            Your connected wallet ({address?.slice(0, 6)}...{address?.slice(-4)}) is not a participant in this transaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Only the sender ({transaction.sender?.slice(0, 6)}...{transaction.sender?.slice(-4)}) or 
            receiver ({transaction.receiver?.slice(0, 6)}...{transaction.receiver?.slice(-4)}) can perform actions.
          </p>
        </CardContent>
      </Card>
    );
  }

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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="releaseAmount">Amount to Release (ETH)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-violet-300/70">Ξ</span>
                      <Input
                        id="releaseAmount"
                        type="string"
                        value={releaseAmount}
                        onChange={(e) => {
                          const value = e.target.value.trim();
                          // Only allow numbers and a single decimal point
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            setReleaseAmount(value);
                          }
                        }}
                        className="pl-8"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-sm text-violet-300/70">
                      Available: {transaction.type === 'TOKEN' ? transaction.tokenInfo?.symbol : 'Ξ'} {formatAmount(transaction.amount, transaction.tokenInfo?.decimals || 18)}
                    </p>
                  </div>
                  <ActionButton
                    onClick={handleReleaseFunds}
                    disabled={isLoading !== null || !isSender || !validateAmount(releaseAmount)}
                    disabledReason={getReleaseFundsDisabledReason() || (!validateAmount(releaseAmount) && "Please enter a valid amount")}
                    className="w-full"
                  >
                    {isLoading === 'release' ? 'Processing...' : 'Release Funds to Receiver'}
                  </ActionButton>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reimburseAmount">Amount to Reimburse (ETH)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-violet-300/70">Ξ</span>
                      <Input
                        id="reimburseAmount"
                        type="string"
                        value={reimburseAmount}
                        onChange={(e) => {
                          const value = e.target.value.trim();
                          // Only allow numbers and a single decimal point
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            setReimburseAmount(value);
                          }
                        }}
                        className="pl-8"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-sm text-violet-300/70">
                      Available: {transaction.type === 'TOKEN' ? transaction.tokenInfo?.symbol : 'Ξ'} {formatAmount(transaction.amount, transaction.tokenInfo?.decimals || 18)}
                    </p>
                  </div>
                  <ActionButton
                    onClick={handleReimburse}
                    disabled={isLoading !== null || !isReceiver || !validateAmount(reimburseAmount)}
                    disabledReason={getReimburseDisabledReason() || (!validateAmount(reimburseAmount) && "Please enter a valid amount")}
                    variant="outline"
                    className="w-full"
                  >
                    {isLoading === 'reimburse' ? 'Processing...' : 'Reimburse Funds to Sender'}
                  </ActionButton>
                </div>
              </>
            )}

            {canStartDispute && !hasDispute && (
              <>
                {isSender && (
                  <div className="space-y-2">
                    <p className="text-sm text-violet-300/70">
                      Arbitration Fee: Ξ {arbitrationCost ? ethers.utils.formatEther(arbitrationCost) : 'Loading...'}
                    </p>
                    <ActionButton
                      onClick={handlePayArbitrationFeeSender}
                      disabled={isLoading !== null}
                      disabledReason={getArbitrationFeeDisabledReason()}
                      variant="secondary"
                      className="w-full"
                    >
                      {isLoading === 'paySenderFee' ? 'Processing...' : 'Pay Arbitration Fee (as Sender)'}
                    </ActionButton>
                  </div>
                )}

                {isReceiver && (
                  <div className="space-y-2">
                    <p className="text-sm text-violet-300/70">
                      Arbitration Fee: Ξ {arbitrationCost ? ethers.utils.formatEther(arbitrationCost) : 'Loading...'}
                    </p>
                    <ActionButton
                      onClick={handlePayArbitrationFeeReceiver}
                      disabled={isLoading !== null}
                      disabledReason={getArbitrationFeeDisabledReason()}
                      variant="secondary"
                      className="w-full"
                    >
                      {isLoading === 'payReceiverFee' ? 'Processing...' : 'Pay Arbitration Fee (as Receiver)'}
                    </ActionButton>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <ActionButton
            onClick={() => setEvidenceDialogOpen(true)}
            disabled={isLoading !== null || !isParticipant}
            disabledReason={getEvidenceDisabledReason()}
            variant="outline"
            className="w-full"
          >
            {isLoading === 'evidence' ? 'Processing...' : 'Submit Evidence'}
          </ActionButton>
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
