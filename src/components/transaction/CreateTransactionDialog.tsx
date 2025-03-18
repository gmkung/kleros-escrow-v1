
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { createSignerClient } from "@/lib/kleros";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileJson } from "lucide-react";
import CreateTransactionForm, { CreateTransactionFormData } from "./CreateTransactionForm";
import TransactionJsonPreview from "./TransactionJsonPreview";

interface CreateTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTransactionDialog = ({ isOpen, onClose }: CreateTransactionDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("form");
  const [formValues, setFormValues] = useState<CreateTransactionFormData>({
    title: "",
    description: "",
    category: "Services",
    amount: "",
    receiverAddress: "",
    timeoutDays: "30",
  });

  const handleSubmitForm = async (data: CreateTransactionFormData) => {
    // Update form values for JSON preview
    setFormValues(data);
    await handleCreateTransaction(data);
  };

  const handleSubmitFromJson = async () => {
    await handleCreateTransaction(formValues);
  };

  const handleCreateTransaction = async (data: CreateTransactionFormData) => {
    try {
      setIsSubmitting(true);

      // Show connecting toast
      toast({
        title: "Connecting to wallet",
        description: "Please approve the connection in your wallet",
      });

      // Get client with signer
      const signerClient = await createSignerClient();

      // Show preparing toast
      toast({
        title: "Preparing transaction",
        description: "Creating metadata and preparing transaction",
      });

      // Create meta-evidence
      const metaEvidenceURI = await signerClient.services.ipfs.uploadMetaEvidence({
        title: data.title,
        description: data.description,
        category: data.category,
        question: "Should the payment be released to the receiver?",
        rulingOptions: {
          titles: ["Release to sender", "Release to receiver"],
          descriptions: [
            "Funds will be returned to the sender",
            "Funds will be sent to the receiver",
          ],
        },
      });

      // Show confirmation toast
      toast({
        title: "Confirm transaction",
        description: "Please confirm the transaction in your wallet",
      });

      // Convert days to seconds for timeout
      const timeoutInSeconds = parseInt(data.timeoutDays) * 24 * 60 * 60;

      // Convert ETH amount to wei
      const amountInWei = ethers.utils.parseEther(data.amount);

      // Create the transaction
      const result = await signerClient.actions.transaction.createTransaction({
        receiver: data.receiverAddress,
        value: data.amount,
        timeoutPayment: timeoutInSeconds,
        metaEvidence: metaEvidenceURI,
      });

      // Show success toast
      toast({
        title: "Transaction created",
        description: `Transaction ID: ${result.transactionId}`,
      });

      // Reset form values
      setFormValues({
        title: "",
        description: "",
        category: "Services",
        amount: "",
        receiverAddress: "",
        timeoutDays: "30",
      });

      // Close dialog
      onClose();

      // Navigate to the newly created transaction
      navigate(`/transaction/${result.transactionId}`);
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      toast({
        title: "Error creating transaction",
        description: error.message || "Failed to create transaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Escrow Transaction</DialogTitle>
          <DialogDescription>
            Set up a new escrow payment with dispute resolution through Kleros
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 bg-tron-dark/50">
            <TabsTrigger value="form" className="data-[state=active]:bg-violet-500/20">Form</TabsTrigger>
            <TabsTrigger value="json" className="data-[state=active]:bg-violet-500/20">
              <FileJson className="mr-2 h-4 w-4" />
              JSON Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <CreateTransactionForm
              onSubmit={handleSubmitForm}
              isSubmitting={isSubmitting}
              onCancel={onClose}
            />
          </TabsContent>
          
          <TabsContent value="json">
            <TransactionJsonPreview
              formData={formValues}
              onSubmit={handleSubmitFromJson}
              onCancel={onClose}
              isSubmitting={isSubmitting}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTransactionDialog;
