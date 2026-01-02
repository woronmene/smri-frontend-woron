import SignInForm from "@/components/SignInForm";
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
            src="/smri_logo.svg"
            alt="smri logo"
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
          <div className="text-center min-w-[320px] sm:w-[480px] bg-transparent">
            {/* Spacing */}
            <div className="min-h-[50px] md:hidden"></div>

            {/* Page title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl lg:text-[32px] text-center font-semibold text-gray-900 dark:text-white mb-2">
                Admin Login
              </h1>
              <p className="text-[#737373] text-base dark:text-gray-400">
                Sign in to the administrative dashboard
              </p>
            </div>

            {/* Container */}
            <div className="bg-white">
              {/* Sign in form */}
              <div className="mb-8">
                {/* We stick to 'student' (individual) in backend mapping as per main login logic, 
                    but visually hide it. The backend handles admin by email/role lookup usually. 
                    If we need a specific 'admin' role string, we can change defaultRole="admin" 
                    if the backend supports it. For now, assuming admins auth as "user" then get redirected.
                */}
                <SignInForm hideRoleSelection={true} defaultRole="student" />
              </div>

              {/* Back to regular login */}
              <div className="flex justify-center items-center gap-2 text-[14px]">
                 <p className="text-gray-600 dark:text-gray-400">
                  Not an admin?
                </p>
                <Link
                  className="font-medium text-[#20646D] underline"
                  href="/auth/sign-in"
                >
                  Sign in here
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
