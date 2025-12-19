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
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useResetPassword } from "@/hooks/auth-api";

const ResetPasseordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export default function ResetPasseordForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = useResetPassword();

  const form = useForm({
    resolver: zodResolver(ResetPasseordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    const payload = {
      token: "mock-reset-token",
      new_password: data.password,
    };
    reset.mutate(payload);

    router.push("/auth/sign-in");
  };

  console.log(reset.data);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex-1">
        {/*New Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>New password</FormLabel>
              <FormControl>
                <div className="relative h-auto w-auto">
                  <span className="absolute top-1/2 -translate-y-1/2 left-4">
                    <Image
                      src="/lock_icon.svg"
                      alt="lock_icon.svg"
                      width={15}
                      height={15}
                      className="h-auto w-auto"
                    />
                  </span>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    {...field}
                    className="px-10 min-h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-600"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
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
            <FormItem className="mb-4">
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <div className="relative h-auto w-auto">
                  <span className="absolute top-1/2 -translate-y-1/2 left-4">
                    <Image
                      src="/lock_icon.svg"
                      alt="lock_icon.svg"
                      width={15}
                      height={15}
                      className="h-auto w-auto"
                    />
                  </span>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    {...field}
                    className="px-10 min-h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <Eye size={18} />
                    ) : (
                      <EyeOff size={18} />
                    )}
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
          disabled={loading}
          className="w-full bg-primary min-h-14 px-4 text-[16px] rounded-full font-semibold mt-6 shadow"
        >
          {loading ? (
            <>
              <Spinner /> Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>

        {reset.error && (
          <p className="mt-3 text-center w-full text-red-600 text-xs font-medium">
            Error: {reset.error.message}
          </p>
        )}
      </form>
    </Form>
  );
}
