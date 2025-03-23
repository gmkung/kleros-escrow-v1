import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { jsPDF } from "jspdf";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, FileJson, FileText } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("form");

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

      toast({
        title: "Connecting to wallet",
        description: "Please approve the connection in your wallet",
      });

      const signerClient = await createSignerClient();

      toast({
        title: "Preparing transaction",
        description: "Creating metadata and preparing transaction",
      });

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

      toast({
        title: "Confirm transaction",
        description: "Please confirm the transaction in your wallet",
      });

      const timeoutInSeconds = parseInt(data.timeoutDays) * 24 * 60 * 60;
      const amountInWei = ethers.utils.parseEther(data.amount);

      const result = await signerClient.actions.transaction.createTransaction({
        receiver: data.receiverAddress,
        value: data.amount,
        timeoutPayment: timeoutInSeconds,
        metaEvidence: metaEvidenceURI,
      });

      toast({
        title: "Transaction created",
        description: `Transaction ID: ${result.transactionId}`,
      });

      form.reset();
      onClose();
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

  const getMetaEvidenceJson = () => {
    const formValues = form.getValues();
    
    return {
      title: formValues.title,
      description: formValues.description,
      category: formValues.category,
      question: "Should the payment be released to the receiver?",
      rulingOptions: {
        titles: ["Release to sender", "Release to receiver"],
        descriptions: [
          "Funds will be returned to the sender",
          "Funds will be sent to the receiver",
        ],
      },
      transactionDetails: {
        receiver: formValues.receiverAddress,
        value: formValues.amount + " ETH",
        timeoutPayment: parseInt(formValues.timeoutDays) * 24 * 60 * 60 + " seconds",
        timeoutInDays: formValues.timeoutDays + " days"
      }
    };
  };

  const downloadJson = () => {
    const jsonData = getMetaEvidenceJson();
    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `kleros-escrow-${new Date().getTime()}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "JSON Downloaded",
      description: "Transaction data has been downloaded as JSON",
    });
  };

  const downloadPdf = () => {
    const jsonData = getMetaEvidenceJson();
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Kleros Escrow Transaction", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Title: ${jsonData.title || "Untitled"}`, 20, 40);
    doc.text(`Description: ${(jsonData.description || "No description").substring(0, 50)}${jsonData.description && jsonData.description.length > 50 ? "..." : ""}`, 20, 50);
    doc.text(`Category: ${jsonData.category || "Uncategorized"}`, 20, 60);
    doc.text(`Receiver: ${jsonData.transactionDetails.receiver || "Not specified"}`, 20, 70);
    doc.text(`Amount: ${jsonData.transactionDetails.value || "0 ETH"}`, 20, 80);
    doc.text(`Timeout: ${jsonData.transactionDetails.timeoutInDays || "30 days"}`, 20, 90);
    
    const jsonLines = JSON.stringify(jsonData, null, 2).split("\n");
    let y = 110;
    
    for (const line of jsonLines) {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 6;
    }
    
    doc.save(`kleros-escrow-${new Date().getTime()}.pdf`);
    
    toast({
      title: "PDF Downloaded",
      description: "Transaction data has been downloaded as PDF",
    });
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

        <Tabs defaultValue="form" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Transaction Form</TabsTrigger>
            <TabsTrigger value="json">JSON Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
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
                              placeholder="Detail the terms of the agreement and what constitutes successful completion ..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This will be used by the jury of Kleros to rule on any potential disputes
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
          </TabsContent>
          
          <TabsContent value="json">
            <Card>
              <CardContent className="pt-6">
                <div className="bg-tron-dark/80 rounded-md p-4 border border-violet-500/30">
                  <pre className="text-violet-100 text-sm whitespace-pre-wrap overflow-auto max-h-[400px]">
                    {JSON.stringify(getMetaEvidenceJson(), null, 2)}
                  </pre>
                </div>
                <p className="text-xs text-violet-300/80 mt-2">
                  This is a preview of the JSON data that will be uploaded to IPFS as meta-evidence for this transaction.
                </p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2 border-tron-light/30 hover:bg-tron-light/10"
                    onClick={downloadJson}
                  >
                    <FileJson className="h-4 w-4" />
                    <span>Download JSON</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2 border-tron-light/30 hover:bg-tron-light/10"
                    onClick={downloadPdf}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Download PDF</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setActiveTab("form")}
                disabled={isSubmitting}
              >
                Back to Form
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTransactionDialog;
