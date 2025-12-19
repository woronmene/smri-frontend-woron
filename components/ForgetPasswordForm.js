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

export default function ForgetPasswordForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const forgot = useForgotPassword();

  const form = useForm({
    resolver: zodResolver(ForgetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    forgot.mutate(data);    
  };

  console.log(forgot.data);


  return (
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
          disabled={loading}
          className="w-full bg-primary min-h-14 px-4 text-[16px] rounded-full font-semibold mt-8 shadow"
        >
          {loading ? (
            <>
              <Spinner /> Sending...
            </>
          ) : (
            "Send Link"
          )}
        </Button>

        {forgot.error&&
        <p className="mt-3 text-center w-full text-red-600 text-xs font-medium">
          Error: {forgot.error.message}
        </p>}
      </form>
    </Form>
  );
}
