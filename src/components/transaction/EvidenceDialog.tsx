
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

interface EvidenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EvidenceFormData) => Promise<void>;
  isLoading: boolean;
}

export interface EvidenceFormData {
  title: string;
  description: string;
  file?: File;
}

const EvidenceDialog = ({ isOpen, onClose, onSubmit, isLoading }: EvidenceDialogProps) => {
  const { toast } = useToast();
  const [fileSelected, setFileSelected] = useState<boolean>(false);
  
  const form = useForm<EvidenceFormData>({
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const handleSubmit = async (data: EvidenceFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      setFileSelected(false);
    } catch (error: any) {
      toast({
        title: "Error submitting evidence",
        description: error.message || "Failed to submit evidence",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("file", file);
      setFileSelected(true);
    } else {
      form.setValue("file", undefined);
      setFileSelected(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Evidence</DialogTitle>
          <DialogDescription>
            Provide details about your evidence to support your case in this transaction.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Delivery Proof" {...field} />
                  </FormControl>
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
                      placeholder="Describe your evidence and how it supports your position..."
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>File Attachment (Optional)</FormLabel>
              <Input
                type="file"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {fileSelected && (
                <p className="text-sm text-green-600">File selected</p>
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Evidence"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EvidenceDialog;
