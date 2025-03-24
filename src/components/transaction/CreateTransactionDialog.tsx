import { useState, useEffect } from "react";
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
import { useAccount } from "wagmi";

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
  file?: File;
  fileURI?: string;
}

const CreateTransactionDialog = ({ isOpen, onClose }: CreateTransactionDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { address: senderAddress } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("form");
  const [previewJson, setPreviewJson] = useState<any>(null);

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

  const createMetaEvidence = async (formData: CreateTransactionFormData, signerClient: any) => {
    const timeoutSeconds = parseInt(formData.timeoutDays) * 24 * 60 * 60;

    return {
      title: formData.title,
      description: formData.description,
      category: "Escrow",
      subCategory: formData.category,
      question: "Which party abided by terms of the contract?",
      rulingOptions: {
        type: "single-select",
        titles: [
          "Refund Sender",
          "Pay Receiver"
        ],
        descriptions: [
          "Select to return funds to the Sender",
          "Select to release funds to the Receiver"
        ]
      },
      arbitrableAddress: "0x0d67440946949fe293b45c52efd8a9b3d51e2522",
      fileURI: formData.fileURI || "",
      receiver: formData.receiverAddress,
      amount: formData.amount,
      timeout: timeoutSeconds,
      token: {
        name: "Ethereum",
        ticker: "ETH",
        symbolURI: "/static/media/eth.33901ab6.png",
        address: null,
        decimals: 18
      },
      invoice: false,
      evidenceDisplayInterfaceURI: "/ipfs/QmfPnVdcCjApHdiCC8wAmyg5iR246JvVuQGQjQYgtF8gZU/index.html",
      aliases: {
        sender: senderAddress || null,
        receiver: formData.receiverAddress
      }
    };
  };

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

      // Convert amount to Wei for metadata
      const amountInWei = ethers.utils.parseEther(data.amount).toString();

      // Create metadata with Wei amount
      const metaEvidence = await createMetaEvidence({
        ...data,
        amount: amountInWei // Use Wei in metadata
      }, signerClient);
      
      const metaEvidenceURI = await signerClient.services.ipfs.uploadMetaEvidence(metaEvidence);

      toast({
        title: "Confirm transaction",
        description: "Please confirm the transaction in your wallet",
      });

      const timeoutInSeconds = parseInt(data.timeoutDays) * 24 * 60 * 60;

      const result = await signerClient.actions.transaction.createTransaction({
        receiver: data.receiverAddress,
        value: amountInWei, // Use Wei for contract call
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

  const getMetaEvidenceJson = async () => {
    const formValues = form.getValues();
    const signerClient = await createSignerClient();
    return createMetaEvidence(formValues, signerClient);
  };

  const downloadJson = async () => {
    const jsonData = await getMetaEvidenceJson();
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

  const downloadPdf = async () => {
    const jsonData = await getMetaEvidenceJson();
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Kleros Escrow Transaction", 20, 20);

    doc.setFontSize(12);
    doc.text(`Title: ${jsonData.title || "Untitled"}`, 20, 40);
    doc.text(`Description: ${(jsonData.description || "No description").substring(0, 50)}${jsonData.description && jsonData.description.length > 50 ? "..." : ""}`, 20, 50);
    doc.text(`Category: ${jsonData.category || "Uncategorized"}`, 20, 60);
    doc.text(`Receiver: ${jsonData.receiver || "Not specified"}`, 20, 70);
    doc.text(`Amount: ${jsonData.amount || "0 ETH"}`, 20, 80);
    doc.text(`Timeout: ${jsonData.timeout / (24 * 60 * 60) || "30 days"}`, 20, 90);

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

  const handleFileUpload = async (file: File) => {
    try {
      const signerClient = await createSignerClient();
      const fileBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(fileBuffer);
      const cid = await signerClient.services.ipfs.uploadToIPFS(uint8Array, file.name);
      const fileURI = `/ipfs/${cid}`;
      form.setValue("fileURI", fileURI);
      form.setValue("file", file);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error uploading file",
        description: "Failed to upload file to IPFS",
        variant: "destructive",
      });
    }
  };

  // Add effect to update preview when form values change
  useEffect(() => {
    const updatePreview = async () => {
      try {
        const jsonData = await getMetaEvidenceJson();
        setPreviewJson(jsonData);
      } catch (error) {
        console.error("Error generating preview:", error);
        setPreviewJson(null);
      }
    };
    updatePreview();
  }, [form.watch()]); // Watch all form values

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
                            value: /^\d*\.?\d*$/,
                            message: "Must be a valid number"
                          },
                          validate: {
                            positive: (value) => parseFloat(value) > 0 || "Amount must be greater than 0",
                            validEth: (value) => {
                              try {
                                ethers.utils.parseEther(value);
                                return true;
                              } catch (e) {
                                return "Invalid ETH amount";
                              }
                            }
                          }
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (ETH)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="0.1"
                                  type="text"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value.trim();
                                    // Only allow numbers and a single decimal point
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                      field.onChange(value);
                                    }
                                  }}
                                  className="pl-8"
                                />
                                <span className="absolute left-3 top-2.5 text-muted-foreground">Ξ</span>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Amount to be held in escrow (in ETH). Will be converted to Wei for the transaction.
                              {field.value && !isNaN(parseFloat(field.value)) && (
                                <div className="mt-1 text-xs text-violet-300/70">
                                  ≈ {ethers.utils.parseEther(field.value || "0").toString()} Wei
                                </div>
                              )}
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

                    <FormField
                      control={form.control}
                      name="file"
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormItem>
                          <FormLabel>Attachment (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  await handleFileUpload(file);
                                }
                              }}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Upload any relevant files (e.g., contract, invoice, etc.)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                    {previewJson ? JSON.stringify(previewJson, null, 2) : "Loading preview..."}
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
                    disabled={!previewJson}
                  >
                    <FileJson className="h-4 w-4" />
                    <span>Download JSON</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2 border-tron-light/30 hover:bg-tron-light/10"
                    onClick={downloadPdf}
                    disabled={!previewJson}
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
