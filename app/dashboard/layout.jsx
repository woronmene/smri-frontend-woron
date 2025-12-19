'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

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
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
