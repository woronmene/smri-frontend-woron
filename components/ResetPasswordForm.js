"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useResetPassword } from "@/hooks/auth-api";
import { Eye, EyeOff } from "lucide-react";

const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

import { toast } from "sonner";

// ... (schema remains)

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const accountRoleData = [
  { key: "Individual", value: "individual" },
  { key: "Organization", value: "organization" },
];

export default function ResetPasswordForm({ email, token }) {
  const router = useRouter();
  const reset = useResetPassword();
  
  const [accountRole, setAccountRole] = useState("individual");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await reset.mutateAsync({
        email,
        token,
        new_password: data.password,
        type: accountRole,
      });
      
      toast.success("Password reset successful", {
          description: "Redirecting to login...",
      });
      
      // Redirect to login after success
      setTimeout(() => {
          router.push("/auth/sign-in");
      }, 2000);
      
    } catch (err) {
      toast.error("Reset failed", {
          description: err.message || "Could not update password.",
      });
    }
  };

  if (reset.isSuccess) {
      return (
          <div className="w-full text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Password Reset Successful</h3>
              <p className="text-green-700">You can now log in with your new password.</p>
              <p className="text-sm text-green-600 mt-4">Redirecting to login...</p>
          </div>
      );
  }

  return (
    <div className="w-full">
      {/* Account Type Toggle (Consistent with SignIn/SignUp) */}
      <div className="flex flex-col items-start gap-2 mb-6">
          <Label className="text-sm font-medium">Account Role</Label>
          <ToggleGroup
            type="single"
            value={accountRole}
            onValueChange={(val) => val && setAccountRole(val)}
            className="flex gap-3 justify-between items-center w-full"
          >
            {accountRoleData.map((item) => (
              <ToggleGroupItem
                key={item.value}
                value={item.value}
                className={cn(
                  "px-4 sm:px-10 min-h-12 border-2 rounded-[12px] font-medium flex-1",
                  accountRole === item.value &&
                    "data-[state=on]:border-primary data-[state=on]:bg-primary/15 data-[state=on]:hover:bg-primary/25"
                )}
              >
                <Image
                  src={
                    accountRole === item.value
                      ? "/account_role_selected.svg"
                      : "/account_role_unselected.svg"
                  }
                  alt="role_icon"
                  width={15}
                  height={15}
                  className="h-auto w-auto mr-2"
                />
                {item.key}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex-1 space-y-4">
          
          {/* Email Display (Read Only) */}
          <div className="mb-4">
             <label className="text-sm font-medium text-gray-700">Email</label>
             <div className="mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm">
                 {email}
             </div>
          </div>

          {/* New Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      {...field}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      {...field}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            variant="primary"
            type="submit"
            disabled={reset.isPending}
            className="w-full bg-primary min-h-14 px-4 text-[16px] rounded-full font-semibold mt-8 shadow"
          >
            {reset.isPending ? (
              <>
                <Spinner /> Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>

          {reset.error && (
            <p className="mt-3 text-center w-full text-red-600 text-xs font-medium">
              Error: {reset.error.message}
            </p>
          )}
        </form>
      </Form>
    </div>
  );
}
