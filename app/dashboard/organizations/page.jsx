"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { getSchools } from "@/lib/admin-api";
import { toast } from "sonner";
import Image from "next/image";

export default function OrganizationsPage() {
  const router = useRouter();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const data = await getSchools();
      // Ensure data is array
      setSchools(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = schools.filter(school => 
    school.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>All Organizations ({filteredSchools.length})</CardTitle>
            <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search organizations..." 
                    className="pl-8" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
                </div>
            ) : filteredSchools.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No organizations found.</p>
                    {searchTerm && <Button variant="link" onClick={() => setSearchTerm("")}>Clear search</Button>}
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Organization</TableHead>
                            <TableHead>Contact Email</TableHead>
                            <TableHead>Verified</TableHead>
                            <TableHead>Joined Date</TableHead>
                            {/* <TableHead className="text-right">Actions</TableHead> */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSchools.map((school) => (
                            <TableRow key={school.school_id || school.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold">
                                            {school.name?.[0]?.toUpperCase() || "O"}
                                        </div>
                                        <span>{school.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{school.email}</TableCell>
                                <TableCell>
                                    {school.is_verified ? (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            Verified
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                            Pending
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {school.created_at ? new Date(school.created_at).toLocaleDateString() : "-"}
                                </TableCell>
                                {/* <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </TableCell> */}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
