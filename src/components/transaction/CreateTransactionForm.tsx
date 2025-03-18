
import { useForm } from "react-hook-form";
import { ethers } from "ethers";
import { createSignerClient } from "@/lib/kleros";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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

export interface CreateTransactionFormData {
  title: string;
  description: string;
  category: string;
  amount: string;
  receiverAddress: string;
  timeoutDays: string;
}

interface CreateTransactionFormProps {
  onSubmit: (data: CreateTransactionFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const CreateTransactionForm = ({ 
  onSubmit, 
  isSubmitting, 
  onCancel 
}: CreateTransactionFormProps) => {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card className="border-violet-500/30 bg-tron-dark/30">
          <CardContent className="pt-6 space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-violet-100">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Project payment" {...field} className="border-violet-500/30 bg-tron-dark/50 text-violet-100" />
                  </FormControl>
                  <FormDescription className="text-violet-300/70">
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
                  <FormLabel className="text-violet-100">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of the agreement..."
                      className="min-h-[120px] border-violet-500/30 bg-tron-dark/50 text-violet-100"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-violet-300/70">
                    Detail the terms of the agreement and what constitutes successful completion
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="border-violet-500/30 bg-tron-dark/30">
          <CardContent className="pt-6 space-y-4">
            <FormField
              control={form.control}
              name="category"
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-violet-100">Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Services" {...field} className="border-violet-500/30 bg-tron-dark/50 text-violet-100" />
                  </FormControl>
                  <FormDescription className="text-violet-300/70">
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
                  <FormLabel className="text-violet-100">Receiver Ethereum Address</FormLabel>
                  <FormControl>
                    <Input placeholder="0x..." {...field} className="border-violet-500/30 bg-tron-dark/50 text-violet-100" />
                  </FormControl>
                  <FormDescription className="text-violet-300/70">
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
                    <FormLabel className="text-violet-100">Amount (ETH)</FormLabel>
                    <FormControl>
                      <Input placeholder="0.1" type="text" {...field} className="border-violet-500/30 bg-tron-dark/50 text-violet-100" />
                    </FormControl>
                    <FormDescription className="text-violet-300/70">
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
                    <FormLabel className="text-violet-100">Timeout (days)</FormLabel>
                    <FormControl>
                      <Input placeholder="30" type="text" {...field} className="border-violet-500/30 bg-tron-dark/50 text-violet-100" />
                    </FormControl>
                    <FormDescription className="text-violet-300/70">
                      Days until timeout can be executed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
            type="submit"
            disabled={isSubmitting}
            className="btn-tron"
          >
            {isSubmitting ? "Creating..." : "Create Transaction"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateTransactionForm;
