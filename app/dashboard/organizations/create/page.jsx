"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { ChevronLeft, Eye, EyeOff, Building2, Copy, Check } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Schema similar to sign up but simplified for admin creation
const formSchema = z.object({
  organizationName: z.string().min(2, "Organization name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export default function CreateOrganizationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successData, setSuccessData] = useState(null); // { email: string }

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const nameParts = data.organizationName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || ".";

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: data.email,
          password: data.password,
          invite_code: "ADMIN_CREATED",
          type: "organization",
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to create organization");
      }

      setSuccessData({ email: data.email });
      toast.success("Organization created successfully");

    } catch (error) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessData(null);
    router.push("/dashboard/organizations");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ChevronLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Organization</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            Create a new organization account. They will receive an email to verify their account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input placeholder="Acme University" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                         <div className="absolute left-3 top-2.5 h-5 w-5 flex items-center justify-center">
                            <Image src="/email_icon.svg" width={16} height={16} alt="email" className="w-4 h-4 opacity-50" />
                         </div>
                        <Input placeholder="admin@organization.com" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-3 top-2.5 h-5 w-5 flex items-center justify-center">
                            <Image src="/lock_icon.svg" width={16} height={16} alt="lock" className="w-4 h-4 opacity-50" />
                         </div>
                        <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="*******" 
                            {...field} 
                            className="pl-10" 
                        />
                         <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white min-w-[120px]" disabled={isLoading}>
                  {isLoading ? <Spinner className="text-white" /> : "Create Organization"}
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>

      <SuccessDialog 
        open={!!successData} 
        onClose={handleCloseSuccess} 
        email={successData?.email} 
      />
    </div>
  );
}

function SuccessDialog({ open, onClose, email }) {
  const [copied, setCopied] = useState(false);
  const verificationLink = `https://app.smri.world/auth/verify-email?email=${encodeURIComponent(email || "")}&type=organization`;

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationLink);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4 text-green-600">
             <Check size={24} />
          </div>
          <DialogTitle className="text-center">Organization Created Successfully</DialogTitle>
          <DialogDescription className="text-center pt-2">
            An OTP has been sent to <strong>{email}</strong>. 
            <br />
            You can verify the account using the OTP at the link below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 mt-4">
          <div className="grid flex-1 gap-2">
            <div className="relative">
                <Input 
                  readOnly 
                  value={verificationLink} 
                  className="pr-12 text-xs text-gray-500 bg-gray-50"
                />
            </div>
          </div>
          <Button type="button" size="icon" className="px-3" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <DialogFooter className="sm:justify-center mt-4">
          <Button type="button" className="w-full sm:w-auto min-w-[120px]" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
