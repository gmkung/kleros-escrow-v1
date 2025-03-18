import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { createSignerClient, klerosClient } from "@/lib/kleros";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface CreateTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateTransactionFormData {
  title: string;
  description: string;
  category: string;
  amount: string;
  receiverAddress: string;
  timeoutDays: string;
}

const CreateTransactionDialog = ({ isOpen, onClose }: CreateTransactionDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateTransactionFormData>({
    defaultValues: {
      title: "",
      description: "",
      category: "Services",
      amount: "",
      receiverAddress: "",
      timeoutDays: "30",
    },
  });

  const handleSubmit = async (data: CreateTransactionFormData) => {
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

      // Reset form
      form.reset();

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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Escrow Transaction</DialogTitle>
          <DialogDescription>
            Set up a new escrow payment with dispute resolution through Kleros
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Project payment" {...field} />
                      </FormControl>
                      <FormDescription>
                        A short title describing this transaction
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  rules={{ required: "Description is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed description of the agreement..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Detail the terms of the agreement and what constitutes successful completion
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Services" {...field} />
                      </FormControl>
                      <FormDescription>
                        Category of transaction (e.g., Services, Goods, Digital Assets)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="receiverAddress"
                  rules={{ required: "Receiver address is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receiver Ethereum Address</FormLabel>
                      <FormControl>
                        <Input placeholder="0x..." {...field} />
                      </FormControl>
                      <FormDescription>
                        The Ethereum address that will receive the payment if completed successfully
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    rules={{ 
                      required: "Amount is required",
                      pattern: {
                        value: /^[0-9]*\.?[0-9]+$/,
                        message: "Must be a valid number"
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (ETH)</FormLabel>
                        <FormControl>
                          <Input placeholder="0.1" type="text" {...field} />
                        </FormControl>
                        <FormDescription>
                          Amount to be held in escrow
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeoutDays"
                    rules={{ 
                      required: "Timeout is required",
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Must be a valid number"
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeout (days)</FormLabel>
                        <FormControl>
                          <Input placeholder="30" type="text" {...field} />
                        </FormControl>
                        <FormDescription>
                          Days until timeout can be executed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTransactionDialog;
