import Image from "next/image";
import React from "react";
import Link from "next/link";
import ForgetPasswordForm from "@/components/ForgetPasswordForm";

export default function Page() {
  return (
    <div className="min-h-screen w-full relative flex flex-col">
      {/* Global client header */}
      <header className="w-full flex">
        <nav className="flex-1 flex justify-between items-center bg-white px-8 min-h-20 lg:border-b lg:border-gray-200 lg:shadow">
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

      <main className="flex-1 w-full flex bg-white lg:bg-[#FAFAFA]">
        {/* Left side */}
        <section className="flex-1 flex justify-center items-center">
          <div className="flex min-w-[320px] sm:min-w-[510px] bg-white p-4 lg:p-12 lg:rounded-md lg:shadow-md">
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Image
                src="/verirfy_email_icon.svg"
                alt="verirfy_email_icon"
                width={50}
                height={50}
                className="h-auto w-auto"
              />
              {/* Page title */}
              <h1 className="text-2xl lg:text-[32px] text-center font-semibold text-gray-900 dark:text-white mb-2">
                Need help with your <br />
                account?
              </h1>
              <p className="text-gray-600 text-center text-wrap text-base max-w-[320px] lg:max-w-[480px]">
                Enter the email address associated with your account and
                 we will send you a link to reset your password.
              </p>
              <ForgetPasswordForm />
            </div>
          </div>
        </section>
      </main>

      {/* Global client footer */}
      <footer className="flex p-6 bg-[#FAFAFA]">
        <div className="flex-1 flex justify-between px-2">
          <Link className="text-gray-600" href="/privacy-policy">
            Privacy Policy
          </Link>
          <p className="text-gray-600">Copyright 2025</p>
        </div>
      </footer>
    </div>
  );
}
