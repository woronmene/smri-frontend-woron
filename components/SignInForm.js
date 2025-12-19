"use client";

import React, { useState, useContext } from "react";
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
import { useLogin } from "@/hooks/auth-api";
import { AuthContext } from "@/context/AuthContext";

const signinSchema = z.object({
  email: z
    .email("Invalid email address")
    .max(100, "Email is too long")
    .min(3, "Email is required"),
  password: z.string().min(3, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export default function SignInForm() {
  const router = useRouter();
  const auth = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = useLogin();

  const form = useForm({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await login.mutateAsync(data);
      if (result?.status === 'success' && result?.token) {
        auth.login(result.user, result.token);
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      // login.error is handled by the hook usually, but we can set local error if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex-1">
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

        <div className="flex justify-between items-center">
          {/* Remember Me */}
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-primary ring-primary rounded"
                    />
                  </FormControl>
                  <FormLabel className="font-medium">Remember me</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {/* Forgot Password */}
          <Link
            href="/forget-password"
            className="text-gray-600 text-sm font-medium underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          variant="primary"
          type="submit"
          disabled={loading}
          className="w-full bg-primary min-h-14 px-4 text-[16px] rounded-full font-semibold mt-6 shadow"
        >
          {loading ? (
            <>
              <Spinner /> Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        {login.error?.message && (
          <p className="mt-3 text-center w-full text-red-600 text-xs font-medium">
            Error: {login.error.message}
          </p>
        )}
      </form>
    </Form>
  );
}
