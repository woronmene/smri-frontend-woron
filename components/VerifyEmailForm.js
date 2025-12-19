"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useVerifyOtp } from "@/hooks/auth-api";

const optLength = 5;

const verifyEmailSchema = z.object({
  otp: z.string().min(optLength, `Enter all ${optLength} digits`),
  email: z.email("Invalid email address").max(100, "Email is too long"),
});

export default function VerifyEmailForm() {
  const router = useRouter();
  const query = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [resendTimer, setResendTimer] = useState(60);

  const verify = useVerifyOtp();

  const form = useForm({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: "",
      otp: "",
    },
  });

  // Countdown for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Auto fill email
  useEffect(() => {
     const email = query.get("email");
    if (email) {
      form.setValue("email", email);
    }
  }, [query, form]);

  // Resend OTP
  const resendotp = async () => {
    const email = form.getValues("email");

    if (!email || loading || resendTimer > 0) return;

    setResendTimer(60);
  };

  // Verify opt otp
  const onSubmit = async (data) => {   
    verify.mutate(data);

    router.push("/auth/account-verified");
  };


  console.log(verify.data);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex-1">
        {/* otp */}
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputOTP
                  maxLength={optLength}
                  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    if (value.length === 6) handleAutoSubmit(value);
                  }}
                >
                  <div className="w-full flex justify-center items-center">
                    <InputOTPGroup className="flex justify-between gap-3">
                      {[...Array(optLength)].map((_, i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="h-12 md:h-14 w-12 md:w-14 rounded-[12px] m-0"
                        />
                      ))}
                    </InputOTPGroup>
                  </div>
                </InputOTP>
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
          className="w-full bg-primary min-h-14 px-4 text-base rounded-full font-semibold mt-8 shadow"
        >
          {loading ? (
            <>
              <Spinner /> Verifing...
            </>
          ) : (
            "Verify Account"
          )}
        </Button>

        {verify.error && (
          <p className="mt-3 text-center w-full text-red-600 text-xs font-medium">
            Error: {verify.error.message}
          </p>
        )}

        {/* Resend OTP */}
        <button
          type="button"
          onClick={resendotp}
          disabled={resendTimer > 0 || loading}
          className="text-gray-600 text-base text-center w-full mt-8"
        >
          {resendTimer > 0 ? (
            <>
              Resend code in{" "}
              <span className="text-[#20646D] font-medium">{resendTimer}s</span>{" "}
            </>
          ) : (
            "Resend code"
          )}
        </button>
      </form>
    </Form>
  );
}
