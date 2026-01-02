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
import { useForgotPassword } from "@/hooks/auth-api";

const ForgetPasswordSchema = z.object({
  email: z
    .email("Invalid email address")
    .max(100, "Email is too long")
    .min(3, "Email is required"),
});

import { toast } from "sonner";

// ... (schema remains)

export default function ForgetPasswordForm() {
  const router = useRouter();

  const [resetType, setResetType] = useState("individual"); // "individual" or "organization"

  const forgot = useForgotPassword();

  const form = useForm({
    resolver: zodResolver(ForgetPasswordSchema),
    defaultValues: {
      email: "",
      password: "", // Not used here?
    },
  });

  const onSubmit = async (data) => {
    // include resetType in payload
    forgot.mutate({ ...data, type: resetType }, {
      onSuccess: () => {
        toast.success("Reset link sent", {
          description: "If an account exists, check your email.",
        });
      },
      onError: (error) => {
        toast.error("Request failed", {
          description: error.message || "Could not send reset link.",
        });
      }
    });    
  };

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex-1">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative h-auto w-auto">
                    <span className="absolute top-1/2 -translate-y-1/2 left-4">
                      <Image
                        src="/email_icon.svg"
                        alt="email_icon.svg"
                        width={15}
                        height={15}
                        className="h-auto w-auto"
                      />
                    </span>
                    <Input
                      type="email"
                      placeholder="johnyjackson@gmail.com"
                      {...field}
                      className="px-10 min-h-12"
                    />
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
            disabled={forgot.isPending}
            className="w-full bg-primary min-h-14 px-4 text-[16px] rounded-full font-semibold mt-8 shadow"
          >
            {forgot.isPending ? (
              <>
                <Spinner /> Sending...
              </>
            ) : (
              "Send Link"
            )}
          </Button>

          {forgot.isSuccess && (
            <p className="mt-3 text-center w-full text-green-600 text-sm font-medium">
              If an account exists, a reset link has been sent.
            </p>
          )}

          {forgot.error && (
            <p className="mt-3 text-center w-full text-red-600 text-xs font-medium">
              Error: {forgot.error.message}
            </p>
          )}
        </form>
      </Form>
    </div>
  );
}
