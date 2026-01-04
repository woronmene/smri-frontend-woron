import Link from "next/link";
import Image from "next/image";

export default function LegalLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
             <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold text-sm">S</div>
             <span className="font-bold text-gray-900 tracking-tight">SMRI</span>
          </Link>
          <nav className="flex gap-6 text-sm font-medium text-gray-600">
             <Link href="/auth/sign-up" className="hover:text-gray-900 transition-colors">Sign Up</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
           {children}
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} SMRI. All rights reserved.
      </footer>
    </div>
  );
}
