"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import Image from "next/image";
import { Input } from "./ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import Link from "next/link";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";
import { useRegister } from "@/hooks/auth-api";

const accountRoleData = [
  { key: "Student", value: "student" },
  { key: "Teacher", value: "teacher" },
  { key: "Organization", value: "organization" },
];

const signupSchema = z.object({
  accountRole: z
    .string()
    .min(2, "Accounty role is required")
    .max(30, "Accounty role is too long"),
  inviteCode: z.string(),
  fullName: z
    .string()
    .min(2, "Full name is required")
    .max(30, "Full name is too long"),
  email: z
    .email("Invalid email address")
    .max(100, "Email is too long")
    .min(3, "Email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  agreeToPrivacyPolicy: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms",
  }),
});

export default function SignUpForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const register = useRegister();

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      accountRole: accountRoleData[0].value,
      fullName: "",
      email: "",
      inviteCode: "",
      password: "",
      agreeToPrivacyPolicy: false,
    },
  });

  useEffect(() => {
    form.watch("accountRole");
  }, [form]);

  const onSubmit = async (data) => {
    const payload = {
      first_name: data.fullName,
      last_name: data.fullName,
      email: data.email,
      password: data.password,
      invite_code: "54321", // Default to a likely valid one or placeholder
      type: data.accountRole,
    };

    register.mutate(payload);

    router.push("/auth/verify-email?email=" + data.email);
  };

  console.log(register.data);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex-1">
        {/* Accounty role for decktop*/}
        <div className="md:flex flex-col items-start gap-2 mb-4 hidden">
          <Label className="text-sm font-medium">Accounty Role</Label>
          <ToggleGroup
            type="single"
            value={form.getValues("accountRole")}
            onValueChange={(val) => val && form.setValue("accountRole", val)}
            className="flex gap-3 justify-between items-center w-full"
          >
            {accountRoleData.map((item) => (
              <ToggleGroupItem
                key={item.value}
                value={item.value}
                className={cn(
                  "px-10 min-h-12 border-2 rounded-[12px] font-medium",
                  form.getValues("accountRole") === item.value &&
                    "data-[state=on]:border-primary data-[state=on]:bg-primary/15 data-[state=on]:hover:bg-primary/25"
                )}
              >
                <Image
                  src={
                    form.getValues("accountRole") === item.value
                      ? "/account_role_selected.svg"
                      : "/account_role_unselected.svg"
                  }
                  alt="account_role_selected.svg"
                  width={15}
                  height={15}
                  className="h-auto w-auto"
                />
                {item.key}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Full name */}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <div className="relative h-auto w-auto">
                  <span className="absolute top-1/2 -translate-y-1/2 left-4">
                    <Image
                      src="/user_icon.svg"
                      alt="user_icon.svg"
                      width={15}
                      height={15}
                      className="h-auto w-auto"
                    />
                  </span>
                  <Input
                    placeholder="Johny Jackson"
                    {...field}
                    className="px-10 min-h-12"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="mb-4">
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

        {/* Invite code */}
        <FormField
          control={form.control}
          name="inviteCode"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Invite code</FormLabel>
              <FormControl>
                <div className="relative h-auto w-auto">
                  <span className="absolute top-1/2 -translate-y-1/2 left-4">
                    <Image
                      src="/key_icon.svg"
                      alt="key_icon.svg"
                      width={15}
                      height={15}
                      className="h-auto w-auto"
                    />
                  </span>
                  <Input
                    placeholder="45756"
                    {...field}
                    className="px-10 min-h-12"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Password</FormLabel>
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
                    placeholder="*******"
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

        {/* Accounty role for decktop*/}
        <div className="flex flex-col items-start gap-2 mb-4 md:hidden">
          <Label className="text-sm font-medium">Accounty Role</Label>
          <ToggleGroup
            type="single"
            value={form.getValues("accountRole")}
            onValueChange={(val) => val && form.setValue("accountRole", val)}
            className="flex gap-3 justify-between items-center w-full"
          >
            {[accountRoleData[0], accountRoleData[1]].map((item) => (
              <ToggleGroupItem
                key={item.value}
                value={item.value}
                className={cn(
                  "px-10 min-h-12 border-2 rounded-[12px] font-medium",
                  form.getValues("accountRole") === item.value &&
                    "data-[state=on]:border-primary data-[state=on]:bg-primary/15 data-[state=on]:hover:bg-primary/25"
                )}
              >
                <Image
                  src={
                    form.getValues("accountRole") === item.value
                      ? "/account_role_selected.svg"
                      : "/account_role_unselected.svg"
                  }
                  alt="account_role_selected.svg"
                  width={15}
                  height={15}
                  className="h-auto w-auto"
                />
                {item.key}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Agree to privacy policy */}
        <FormField
          control={form.control}
          name="agreeToPrivacyPolicy"
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-wrap text-wrap gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-primary ring-primary rounded"
                  />
                </FormControl>
                <FormLabel className="text-gray-600 flex-1 flex flex-wrap">
                  By creating an account, you agree to our{" "}
                  <Link
                    className="text-[#0A0A0A] font-medium underline"
                    href="/privacy-policy"
                  >
                    Privacy Policy
                  </Link>
                </FormLabel>
              </div>
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
              <Spinner /> Signing up...
            </>
          ) : (
            "Sign Up"
          )}
        </Button>

        {register.error && (
          <p className="mt-3 text-center w-full text-red-600 text-xs font-medium">
            Error: {register.error.message}
          </p>
        )}
      </form>
    </Form>
  );
}
