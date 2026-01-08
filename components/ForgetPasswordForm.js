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

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ... constants
const accountRoleData = [
  { key: "Individual", value: "individual" },
  { key: "Organization", value: "organization" },
];

export default function ForgetPasswordForm() {
  const router = useRouter();
  const [accountRole, setAccountRole] = useState("individual");
  
  const forgot = useForgotPassword();

  const form = useForm({
    resolver: zodResolver(ForgetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    forgot.mutate({ ...data, type: accountRole }, {
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
