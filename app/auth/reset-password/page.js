"use client";

import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { Loader2 } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-bold text-red-600 mb-2">Invalid Link</h3>
        <p className="text-gray-600 mb-6">
          The password reset link is missing required information (token or email).
        </p>
        <Link 
          href="/auth/forget-password"
          className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium"
        >
          Request new link
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm email={email} token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full relative flex flex-col">
      {/* Global client header */}
      <header className="w-full flex">
        <nav className="flex-1 flex justify-between items-center bg-white px-8 min-h-20 lg:border-b lg:border-gray-200 lg:shadow">
          <Link href="/">
             <Image
                src="/SMRI_logo.svg"
                alt="SMRI logo"
                width={160}
                height={50}
                className="h-auto w-auto"
                priority
             />
          </Link>
        </nav>
      </header>

      <main className="flex-1 w-full flex bg-white lg:bg-[#FAFAFA]">
        {/* Centered Content */}
        <section className="flex-1 flex justify-center items-center p-4">
          <div className="flex min-w-[320px] sm:min-w-[510px] bg-white p-4 lg:p-12 lg:rounded-md lg:shadow-md">
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <h1 className="text-2xl lg:text-3xl text-center font-semibold text-gray-900 mb-2">
                Reset Password
              </h1>
              <p className="text-gray-600 text-center text-base mb-6">
                Create a new secure password for your account.
              </p>
              
              <Suspense 
                fallback={
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                }
              >
                <ResetPasswordContent />
              </Suspense>
            </div>
          </div>
        </section>
      </main>

      {/* Global client footer */}
      <footer className="flex p-6 bg-[#FAFAFA]">
        <div className="flex-1 flex justify-between px-2">
          <Link className="text-gray-600 hover:text-gray-900" href="/privacy-policy">
            Privacy Policy
          </Link>
          <p className="text-gray-600">Copyright 2025</p>
        </div>
      </footer>
    </div>
  );
}
