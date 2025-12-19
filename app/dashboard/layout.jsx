'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import { Loader2, Menu, X } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/sign-in');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  // Prevent flash of protected content while redirecting
  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <Sidebar
            className="relative z-50 shadow-xl border-r border-gray-200"
            onNavigate={() => setIsMobileNavOpen(false)}
          />
          <button
            className="flex-1 bg-black/40"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Close navigation"
          />
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar className="border-r border-gray-200" />
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-white md:hidden">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="p-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-gray-900">SMRI Dashboard</span>
          <span className="w-9" aria-hidden="true" />
        </div>

        <div className="px-4 py-6 sm:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
