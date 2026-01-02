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

import { toast } from "sonner";

// ... (schema remains)

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ... imports
// ... schema

const accountRoleData = [
  { key: "Student", value: "student" },
  { key: "Teacher", value: "teacher" },
  { key: "Organization", value: "organization" },
];

export default function SignInForm({ hideRoleSelection = false, defaultRole = "student" }) {
  const router = useRouter();
  const auth = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // Error state can be mostly replaced by toast, but keeping for inline if needed
  const [error, setError] = useState("");

  const login = useLogin();

  // Default to provided defaultRole or "student"
  const [accountRole, setAccountRole] = useState(defaultRole);

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
      // Map 'student'/'teacher' to 'individual' if backend only distinguishes user vs school
      // Or pass exact role. Previous logic was "individual" vs "organization".
      // Let's assume the auth hook or backend can handle "student"/"teacher" as user login, 
      // or we manually map it here to be safe and consistent with previous behavior.
      // Previous behavior: loginType = "individual" | "organization".
      
      let typeToSend = "individual";
      if (accountRole === "organization") {
          typeToSend = "organization";
      } else {
          // Both student and teacher are "individual" users for login endpoint purpose
          typeToSend = "individual";
      }

      const result = await login.mutateAsync({ ...data, type: typeToSend });
      if (result?.status === 'success' && result?.token) {
        toast.success("Signed in successfully");
        auth.login(result.user, result.token, result.accountType || "user");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error("Sign in failed", {
         description: err.message || "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Account Type Toggle (Consistent with SignUp) */}
      {!hideRoleSelection && (
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
      )}

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
            href="/auth/forget-password"
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
    </div>
  );
}
