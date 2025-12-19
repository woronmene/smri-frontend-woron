import SignInForm from "@/components/SignInForm";
import SignUpForm from "@/components/SignUpForm";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import AuthRightSide from "../ui/AuthRightSide";

export default function Page() {
  return (
    <div className="min-h-screen w-full relative flex flex-col">
      {/* Global client header */}
      <header className="w-full flex">
        <nav className="flex-1 flex justify-between items-center absolute top-6 left-10 right-0 bg-transparent">
          {/* Logo */}
          <Image
            src="/SMRI_logo.svg"
            alt="SMRI logo"
            width={160}
            height={50}
            className="h-auto w-auto"
          />
        </nav>
      </header>

      <main className="flex-1 w-full flex">
        {/* Left side */}
        <section
          className="flex-1 flex justify-center items-center"
          style={{
            background: `url("/Pattern.svg")`,
            backgroundSize: "auto",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "top",
          }}
        >
          <div className="text-center min-w-[320px] sm:w-[480px] p-4">
            {/* Spacing */}
            <div className="min-h-20 md:hidden"></div>

            {/* Page title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl lg:text-[32px] text-center font-semibold text-gray-900 dark:text-white mb-2">
                Sign up to SMRI
              </h1>
              <p className="text-gray-600 text-base dark:text-gray-400">
                Learn. Grow. Achieve — anywhere, anytime
              </p>
            </div>

            {/* Container */}
            <div className="bg-white">
              {/* Sign in form */}
              <div className="mb-8">
                <SignUpForm />
              </div>

              {/* Divider */}
              <div className="flex items-center mb-8">
                <div className="grow border-t border-gray-300 dark:border-gray-600"></div>
                <span className="mx-4 text-sm text-gray-500 dark:text-gray-400">
                  Or
                </span>
                <div className="grow border-t border-gray-300 dark:border-gray-600"></div>
              </div>

              {/* Sign in with google */}
              <div className="mb-8">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-3 font-semibold text-[16px] min-h-14 px-4 border shadow rounded-full"
                  type="button"
                >
                  <Image
                    src="/google_logo.svg"
                    alt="google_logo.svg"
                    width={24}
                    height={24}
                  />
                  <span className="block">Sign Up with Google</span>
                </Button>
              </div>

              {/* Sign up link */}
              <div className="flex justify-center items-center gap-2 text-[16px]">
                <p className="text-gray-600 dark:text-gray-400">
                  Already have an account?
                </p>
                <Link
                  className="font-medium text-[#20646D] underline"
                  href="/auth/sign-in"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Right side */}
        <AuthRightSide />
      </main>

      {/* Global client footer */}
      <footer></footer>
    </div>
  );
}
