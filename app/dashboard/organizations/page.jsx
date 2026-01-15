"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrganizationsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-500 mt-1">Manage partner organizations and schools.</p>
        </div>
        <Button 
          onClick={() => router.push("/dashboard/organizations/create")}
          className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2"
        >
          <Plus size={18} />
          Add Organization
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for list of organizations, or just a CTA if list is not implemented yet */}
        <Card className="border-dashed border-2 bg-gray-50/50 shadow-none hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => router.push("/dashboard/organizations/create")}>
            <CardContent className="flex flex-col items-center justify-center h-48 gap-4 text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
                    <Plus size={24} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Add New Organization</h3>
                    <p className="text-sm text-gray-500 mt-1">Create a new school or organization account</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
