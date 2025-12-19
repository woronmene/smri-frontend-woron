import Image from "next/image";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="min-h-screen w-full relative flex flex-col">
      {/* Global client header */}
      <header className="w-full flex">
        <nav className="flex-1 flex justify-between items-center bg-white px-8 min-h-20">
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

      <main className="flex-1 flex bg-white">
        {/* Left side */}
        <section className="flex-1 flex justify-center items-center">
            {/* Page title */}
          <div className="flex-1 flex flex-col items-center justify-center min-w-[320px] max-w-[320px] lg:max-w-[480px]">
            <h1 className="text-center text-2xl lg:text-[32px] font-semibold text-gray-900 mb-2">
              🎉 <br />
              Your Account Has Been <br />
              Successfully Verified!
            </h1>
            <p className="text-gray-600 text-center text-wrap text-base max-w-[320px] lg:max-w-[480px]">
              Great job! Your account is now verified. Hop in and start
              learning.
            </p>
            <Button
              variant="primary"
              type="submit"
              className="w-full bg-primary min-h-14 px-4 text-[16px] rounded-full font-semibold shadow mt-10 lg:mt-16"
            >
              <Link href="/auth/sign-in"> Move to courses</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Global client footer */}
      <footer></footer>
    </div>
  );
}
