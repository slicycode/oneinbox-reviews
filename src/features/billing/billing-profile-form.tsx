"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { countries } from "countries-list";
import {
  billingProfileSchema,
  type BillingProfileInput,
} from "@/lib/validations/billing-profile.schema";

const countriesList = Object.entries(countries)
  .map(([code, country]) => ({
    code,
    name: country.name,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

type BillingProfileFormValues = z.infer<typeof billingProfileSchema>;

const emptyValues: BillingProfileFormValues = {
  country: "",
  state: "",
  city: "",
  street: "",
  zipcode: "",
  isBusinessCustomer: false,
  taxId: "",
};

interface BillingProfileFormProps {
  initialValues?: BillingProfileInput | null;
}

export function BillingProfileForm({
  initialValues,
}: BillingProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<BillingProfileFormValues>({
    resolver: zodResolver(billingProfileSchema),
    defaultValues: {
      ...emptyValues,
      ...initialValues,
    },
  });

  React.useEffect(() => {
    if (initialValues) {
      form.reset({
        ...emptyValues,
        ...initialValues,
      });
    }
  }, [form, initialValues]);

  const watchIsBusinessCustomer = useWatch({
    control: form.control,
    name: "isBusinessCustomer",
  });

  const onSubmit = async (values: BillingProfileFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/billing/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to update billing profile");
        return;
      }

      toast.success("Billing profile updated");
      form.reset({
        ...emptyValues,
        ...result.data,
        taxId: result.data?.taxId ?? "",
      });
    } catch (error) {
      console.error("Billing profile update error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[200px]">
                  {countriesList.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State / Province</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your state or province"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter your street address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="zipcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code / ZIP</FormLabel>
              <FormControl>
                <Input placeholder="Enter your postal code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isBusinessCustomer"
          render={({ field }) => (
            <FormItem className="flex items-start gap-3 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="flex flex-col gap-1 leading-none">
                <FormLabel>Buying for a business</FormLabel>
                <FormDescription>
                  Check this if you&apos;re purchasing on behalf of a business
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {watchIsBusinessCustomer && (
          <FormField
            control={form.control}
            name="taxId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax ID / VAT Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your company's tax ID" {...field} />
                </FormControl>
                <FormDescription>
                  Required for business purchases
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Billing Profile"
          )}
        </Button>
      </form>
    </Form>
  );
}
