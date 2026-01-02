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

export default function ResetPasswordForm({ email, token }) {
  const router = useRouter();
  const reset = useResetPassword();
  
  const [resetType, setResetType] = useState("individual");
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
        type: resetType,
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
      {/* Account Type Toggle */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6">
        <button
          type="button"
          onClick={() => setResetType("individual")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            resetType === "individual"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Individual
        </button>
        <button
          type="button"
          onClick={() => setResetType("organization")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            resetType === "organization"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Organization
        </button>
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
