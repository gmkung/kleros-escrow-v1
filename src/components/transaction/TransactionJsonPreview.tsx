
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreateTransactionFormData } from "./CreateTransactionForm";

interface TransactionJsonPreviewProps {
  formData: CreateTransactionFormData;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const TransactionJsonPreview = ({ 
  formData, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: TransactionJsonPreviewProps) => {
  // Create JSON preview data based on form values
  const jsonPreview = {
    metaEvidence: {
      title: formData.title || "[Title]",
      description: formData.description || "[Description]",
      category: formData.category || "Services",
      question: "Should the payment be released to the receiver?",
      rulingOptions: {
        titles: ["Release to sender", "Release to receiver"],
        descriptions: [
          "Funds will be returned to the sender",
          "Funds will be sent to the receiver",
        ],
      },
    },
    transaction: {
      receiver: formData.receiverAddress || "0x...",
      amount: formData.amount ? `${formData.amount} ETH` : "[Amount]",
      timeoutInSeconds: formData.timeoutDays ? parseInt(formData.timeoutDays) * 24 * 60 * 60 : 30 * 24 * 60 * 60,
    },
  };

  return (
    <div className="space-y-4">
      <Card className="border-violet-500/30 bg-tron-dark/30">
        <CardContent className="pt-6">
          <pre className="bg-tron-dark/60 p-4 rounded-md border border-violet-500/20 text-violet-100 overflow-auto max-h-[400px] text-sm">
            {JSON.stringify(jsonPreview, null, 2)}
          </pre>
          <p className="text-violet-300/70 text-sm mt-4">
            This is a preview of the data that will be used to create your transaction.
          </p>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-violet-500/30 bg-tron-dark/50 text-violet-100 hover:bg-tron-dark/70"
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="btn-tron"
        >
          {isSubmitting ? "Creating..." : "Create Transaction"}
        </Button>
      </div>
    </div>
  );
};

export default TransactionJsonPreview;
