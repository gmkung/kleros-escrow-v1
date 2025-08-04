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
import { TokenSelector } from "@/components/ui/token-selector";
import { Token, tokenService } from "@/lib/tokens";
import { CreateTransactionFormData } from "@/lib/kleros/types";
import { CONTRACT_ADDRESSES, erc20ABI, multipleArbitrableTransactionTokensABI } from "@/lib/kleros/contracts";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface CreateTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTransactionDialog = ({ isOpen, onClose }: CreateTransactionDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { address: senderAddress } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("form");
  const [previewJson, setPreviewJson] = useState<any>(null);
  const [selectedToken, setSelectedToken] = useState<Token>(tokenService.getDefaultToken());
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Add safe token amount formatter to prevent crashes
  const safeFormatTokenAmount = (amount: string, token: Token): string => {
    try {
      if (!amount || amount === '' || isNaN(parseFloat(amount))) {
        return '0';
      }
      return tokenService.parseTokenAmount(amount, token);
    } catch (error) {
      console.warn('Error parsing token amount:', error);
      return '0';
    }
  };

  // Add safe validation for token amounts
  const validateTokenAmount = (amount: string, token: Token): boolean => {
    try {
      if (!amount || amount === '' || isNaN(parseFloat(amount))) {
        return false;
      }
      const parsed = tokenService.parseTokenAmount(amount, token);
      return parsed !== '0';
    } catch (error) {
      return false;
    }
  };

  const form = useForm<CreateTransactionFormData>({
    resolver: zodResolver(z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      category: z.string().min(1, "Category is required"),
      amount: z.string().min(1, "Amount is required").refine((val) => {
        return validateTokenAmount(val, selectedToken);
      }, "Please enter a valid amount"),
      receiverAddress: z.string().min(1, "Receiver address is required").refine((val) => {
        return ethers.utils.isAddress(val);
      }, "Please enter a valid Ethereum address"),
      timeoutDays: z.string().min(1, "Timeout is required").refine((val) => {
        const days = parseInt(val);
        return !isNaN(days) && days > 0;
      }, "Please enter a valid number of days"),
      // Add optional fields for file upload
      fileURI: z.string().optional(),
      file: z.any().optional(),
    })),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      amount: "",
      receiverAddress: "",
      timeoutDays: "30",
      fileURI: "",
      file: undefined,
    },
  });

  const createMetaEvidence = async (formData: CreateTransactionFormData, signerClient: any) => {
    const timeoutSeconds = parseInt(formData.timeoutDays) * 24 * 60 * 60;
    const token = formData.token || selectedToken;

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
      arbitrableAddress: token.isNative ? 
        "0x0d67440946949fe293b45c52efd8a9b3d51e2522" : 
        "0xBCf0d1AD453728F75e9cFD4358ED187598A45e6c",
      fileURI: formData.fileURI || "",
      receiver: formData.receiverAddress,
      amount: formData.amount,
      timeout: timeoutSeconds,
      token: tokenService.getTokenMetadata(token),
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
      const token = data.token || selectedToken;

      toast({
        title: "Connecting to wallet",
        description: "Please approve the connection in your wallet",
      });

      const signerClient = await createSignerClient();

      toast({
        title: "Preparing transaction",
        description: "Creating metadata and preparing transaction",
      });

      // Keep amount in human-readable format for metadata
      const amountInSmallestUnit = tokenService.parseTokenAmount(data.amount, token);

      // Create metadata with human-readable amount
      const metaEvidence = await createMetaEvidence({
        ...data,
        amount: data.amount, // Store human-readable amount in metadata
        token: token
      }, signerClient);
      
      const metaEvidenceURI = await signerClient.ethClient.services.ipfs.uploadMetaEvidence(metaEvidence);

      toast({
        title: "Confirm transaction",
        description: "Please confirm the transaction in your wallet",
      });

      const timeoutInSeconds = parseInt(data.timeoutDays) * 24 * 60 * 60;

      let result;
      if (token.isNative) {
        // ETH transaction
        result = await signerClient.ethClient.actions.transaction.createTransaction({
          receiver: data.receiverAddress,
          value: amountInSmallestUnit,
          timeoutPayment: timeoutInSeconds,
          metaEvidence: metaEvidenceURI,
        });
      } else {
        // ERC20 token transaction - Direct contract interaction
        toast({
          title: "Token approval required",
          description: "Please approve the token spending in your wallet",
        });

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        // Get contract addresses
        const tokenContractAddress = CONTRACT_ADDRESSES.MULTIPLE_ARBITRABLE_TRANSACTION_TOKENS;
        const tokenAddress = token.address;
        
        console.log("Debug info:", {
          tokenContractAddress,
          tokenAddress,
          senderAddress,
          amount: amountInSmallestUnit,
          token: token.symbol
        });
        
        // Create contract instances
        const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer);
        const escrowContract = new ethers.Contract(tokenContractAddress, multipleArbitrableTransactionTokensABI, signer);
        
        // Check if contracts exist
        try {
          const tokenName = await tokenContract.name();
          console.log("Token contract found:", tokenName);
        } catch (error) {
          throw new Error(`Token contract not found at ${tokenAddress}. Please check the token address.`);
        }
        
        try {
          const escrowCode = await provider.getCode(tokenContractAddress);
          if (escrowCode === '0x') {
            throw new Error(`Escrow contract not found at ${tokenContractAddress}. Please check the contract address.`);
          }
          console.log("Escrow contract found");
        } catch (error) {
          throw new Error(`Failed to verify escrow contract: ${error.message}`);
        }
        
        // Check user's token balance
        const userBalance = await tokenContract.balanceOf(senderAddress);
        const requiredAmount = ethers.BigNumber.from(amountInSmallestUnit);
        
        console.log("Balance check:", {
          userBalance: userBalance.toString(),
          requiredAmount: requiredAmount.toString(),
          hasEnough: userBalance.gte(requiredAmount)
        });
        
        if (userBalance.lt(requiredAmount)) {
          throw new Error(`Insufficient ${token.symbol} balance. You have ${tokenService.formatFromSmallestUnit(userBalance.toString(), token)} ${token.symbol}, but need ${tokenService.formatFromSmallestUnit(amountInSmallestUnit, token)} ${token.symbol}.`);
        }
        
        // Check current allowance
        const currentAllowance = await tokenContract.allowance(senderAddress, tokenContractAddress);
        
        console.log("Allowance check:", {
          currentAllowance: currentAllowance.toString(),
          requiredAmount: requiredAmount.toString(),
          needsApproval: currentAllowance.lt(requiredAmount)
        });
        
        // Approve tokens if needed
        if (currentAllowance.lt(requiredAmount)) {
          toast({
            title: "Approving tokens",
            description: `Approving ${tokenService.formatFromSmallestUnit(amountInSmallestUnit, token)} ${token.symbol}`,
          });
          
          const approveTx = await tokenContract.approve(tokenContractAddress, requiredAmount);
          console.log("Approval transaction:", approveTx.hash);
          await approveTx.wait();
          
          toast({
            title: "Tokens approved",
            description: "Token spending approved successfully",
          });
        }
        
        toast({
          title: "Creating transaction",
          description: "Creating escrow transaction with tokens",
        });
        
        console.log("Creating transaction with params:", {
          amount: requiredAmount.toString(),
          token: tokenAddress,
          timeout: timeoutInSeconds,
          receiver: data.receiverAddress,
          metaEvidence: metaEvidenceURI
        });
        
        // Create the escrow transaction with explicit gas limit
        const tx = await escrowContract.createTransaction(
          requiredAmount,
          tokenAddress,
          timeoutInSeconds,
          data.receiverAddress,
          metaEvidenceURI,
          {
            gasLimit: 500000 // Add explicit gas limit
          }
        );
        
        console.log("Transaction submitted:", tx.hash);
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        
        result = {
          transactionId: "created", // Placeholder since we don't need the actual ID
          transactionHash: receipt.transactionHash
        };
        
        // Show success toast
        toast({
          title: "Transaction Created Successfully!",
          description: `Your ${token.isNative ? 'ETH' : 'ERC20'} escrow transaction has been created. You will be redirected to the main page.`,
          variant: "default",
        });
      }

      toast({
        title: "Transaction created",
        description: `Transaction ID: ${result.transactionId}`,
      });

      form.reset();
      setSelectedToken(tokenService.getDefaultToken());
      onClose();
      
      // Navigate back to the main page after successful transaction creation
      navigate('/');
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

  const validateAmount = (value: string): string | undefined => {
    if (!value) return "Amount is required";
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      return "Amount must be a positive number";
    }

    // Check if amount has too many decimal places for the token
    const decimalPlaces = (value.split('.')[1] || '').length;
    if (decimalPlaces > selectedToken.decimals) {
      return `Amount can have at most ${selectedToken.decimals} decimal places for ${selectedToken.symbol}`;
    }

    return undefined;
  };

  const getMetaEvidenceJson = async () => {
    const formData = form.getValues();
    const token = formData.token || selectedToken;
    
    if (!formData.amount || !token) {
      return { 
        title: formData.title || "Untitled",
        description: formData.description || "No description",
        category: "Escrow",
        token: tokenService.getTokenMetadata(token)
      };
    }

    try {
      const amountInSmallestUnit = tokenService.parseTokenAmount(formData.amount, token);
      return await createMetaEvidence({
        ...formData,
        amount: amountInSmallestUnit,
        token: token
      }, null);
    } catch (error) {
      console.error("Error generating preview:", error);
      return { 
        title: formData.title || "Untitled",
        description: formData.description || "No description",
        category: "Escrow",
        token: tokenService.getTokenMetadata(token)
      };
    }
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
    doc.text(`Receiver: ${(jsonData as any).receiver || "Not specified"}`, 20, 70);
    doc.text(`Amount: ${(jsonData as any).amount || "0"} ${jsonData.token?.ticker || ""}`, 20, 80);
    doc.text(`Timeout: ${(jsonData as any).timeout ? (jsonData as any).timeout / (24 * 60 * 60) : "30"} days`, 20, 90);
    
    let currentY = 100;
    if ((jsonData as any).fileURI) {
      doc.text(`Attached File: ${(jsonData as any).fileURI}`, 20, currentY);
      currentY += 10;
    }

    const jsonLines = JSON.stringify(jsonData, null, 2).split("\n");
    let y = currentY + 10;

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
      setIsUploading(true);
      
      toast({
        title: "Uploading file",
        description: "Uploading file to IPFS...",
      });

      const signerClient = await createSignerClient();
      const fileBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(fileBuffer);
      const cid = await signerClient.ethClient.services.ipfs.uploadToIPFS(uint8Array, file.name);
      const fileURI = `/ipfs/${cid}`;
      
      // Update form values
      form.setValue("fileURI", fileURI);
      form.setValue("file", file);
      setUploadedFile(file);
      
      toast({
        title: "File uploaded successfully",
        description: `File uploaded to IPFS: ${fileURI}`,
      });
      
    } catch (error) {
      console.error("Error uploading file:", error);
      
      // Clear any partial upload data
      form.setValue("fileURI", "");
      form.setValue("file", undefined);
      setUploadedFile(null);
      
      toast({
        title: "Error uploading file",
        description: "Failed to upload file to IPFS. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Update form token value when selectedToken changes
  useEffect(() => {
    form.setValue("token", selectedToken);
  }, [selectedToken, form]);

  // Watch specific form fields and update preview when they change
  const title = form.watch("title");
  const description = form.watch("description");
  const category = form.watch("category");
  const amount = form.watch("amount");
  const receiverAddress = form.watch("receiverAddress");
  const timeoutDays = form.watch("timeoutDays");
  const fileURI = form.watch("fileURI");

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
  }, [title, description, category, amount, receiverAddress, timeoutDays, fileURI, selectedToken]); // Added fileURI to dependencies

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Escrow Transaction</DialogTitle>
          <DialogDescription>
            Set up a new escrow payment with dispute resolution through Kleros
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    rules={{ required: "Title is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Payment for services" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="Services" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  rules={{ required: "Description is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the terms of the agreement..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="receiverAddress"
                  rules={{ 
                    required: "Receiver address is required",
                    pattern: {
                      value: /^0x[a-fA-F0-9]{40}$/,
                      message: "Invalid Ethereum address"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receiver Address</FormLabel>
                      <FormControl>
                        <Input placeholder="0x..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Token</FormLabel>
                    <FormControl>
                      <TokenSelector
                        value={selectedToken}
                        onSelect={setSelectedToken}
                      />
                    </FormControl>
                    <FormDescription>
                      Select the token for this escrow transaction
                    </FormDescription>
                  </FormItem>

                  <FormField
                    control={form.control}
                    name="amount"
                    rules={{ 
                      required: "Amount is required",
                      validate: validateAmount
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ({selectedToken.symbol})</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="0.1"
                              type="text"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value.trim();
                                // Allow numbers and decimal point
                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                  field.onChange(value);
                                }
                              }}
                              className="pr-16"
                            />
                            <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">
                              {selectedToken.symbol}
                            </span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Amount to be held in escrow (in {selectedToken.symbol})
                          {field.value && !isNaN(parseFloat(field.value)) && (
                            <div className="mt-1 text-xs text-violet-300/70">
                              ≈ {safeFormatTokenAmount(field.value || "0", selectedToken)} {selectedToken.symbol} (smallest unit)
                            </div>
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="timeoutDays"
                  rules={{ 
                    required: "Timeout is required",
                    min: { value: 1, message: "Timeout must be at least 1 day" }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeout (Days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="30"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of days before the transaction can be automatically executed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Supporting Documents (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setIsUploading(true);
                          handleFileUpload(e.target.files[0]).finally(() => {
                            setIsUploading(false);
                          });
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="file-upload"
                      className={`cursor-pointer text-sm ${isUploading ? 'text-gray-400' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {isUploading ? "Uploading to IPFS..." : "Click to upload a file or drag and drop"}
                    </label>
                    {form.watch("file") && form.watch("fileURI") && (
                      <div className="text-sm text-green-600 mt-2 space-y-1">
                        <p>✓ File uploaded: {form.watch("file")?.name}</p>
                        <p className="text-xs text-gray-500">IPFS URI: {form.watch("fileURI")}</p>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Transaction"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardContent className="pt-6">
                {previewJson ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{previewJson.title}</h3>
                      <p className="text-sm text-muted-foreground">{previewJson.subCategory}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm">{previewJson.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium">Amount</h4>
                        <p className="text-sm">
                          {(previewJson as any).amount || "0"} {previewJson.token?.ticker || ""}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Timeout</h4>
                        <p className="text-sm">
                          {(previewJson as any).timeout ? (previewJson as any).timeout / (24 * 60 * 60) : 0} days
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">Token</h4>
                      <p className="text-sm">{previewJson.token?.name || "Unknown"} ({previewJson.token?.ticker || ""})</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Receiver</h4>
                      <p className="text-sm">{(previewJson as any).receiver || "Not specified"}</p>
                    </div>
                    {(previewJson as any).fileURI && (
                      <div>
                        <h4 className="font-medium">Attached File</h4>
                        <p className="text-sm text-blue-600 break-all">{(previewJson as any).fileURI}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          File has been uploaded to IPFS and will be included in the transaction metadata
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={downloadPdf}>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Fill out the form to see preview</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="json">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileJson className="w-4 h-4" />
                  <span className="text-sm font-medium">MetaEvidence JSON</span>
                </div>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-[400px]">
                  {previewJson ? JSON.stringify(previewJson, null, 2) : "Fill out the form to see JSON"}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTransactionDialog;
