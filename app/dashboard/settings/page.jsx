"use client";

import { useContext, useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/AuthContext";
import { updateUserProfile } from "@/lib/user-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetSchool } from "@/hooks/auth-api";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const isOrgAdmin = (user?.role || "").toLowerCase() === "school_admin";
  const isSmriAdmin = (user?.role || "").toLowerCase() === "smri_admin";

  const { data: schoolData, isLoading: schoolLoading } = useGetSchool(
    isOrgAdmin && !isSmriAdmin
  );

  console.log(schoolData, "schoolData");

  const initialPersonalValues = useMemo(
    () => ({
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      email: user?.email || "",
      school: user?.school_id || user?.schoolId || "",
      // phone & dob removed from UI but kept in state if needed or we can clean up
      phone: "",
      dob: "",
    }),
    [user]
  );

  // Update form when user/school data loads
  useEffect(() => {
    setPersonalForm(initialPersonalValues);
  }, [initialPersonalValues]);

  const [personalForm, setPersonalForm] = useState(initialPersonalValues);

  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      toast.success("Profile Updated", {
        description: "Your personal information has been saved.",
      });
      queryClient.invalidateQueries(["me"]); // Refresh user data
    },
    onError: (error) => {
      toast.error("Update Failed", {
        description: error.message || "Could not update profile.",
      });
    },
  });

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setPersonalForm(initialPersonalValues);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      first_name: personalForm.firstName,
      last_name: personalForm.lastName,
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Top header with title & actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-8 border-b border-gray-200">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Settings
          </h1>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            className="border-gray-300 w-full sm:w-auto rounded-[999px]"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-600 cursor-pointer rounded-[999px] px-4 sm:px-5 py-2.5 sm:py-3 text-black w-full sm:w-auto"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Main Content Area - direct render since tabs are removed */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10">
          <PersonalInfoForm
            values={personalForm}
            onChange={handlePersonalChange}
            user={user}
            isOrgAdmin={isOrgAdmin}
            isSmriAdmin={isSmriAdmin}
            schoolData={schoolData}
            schoolLoading={schoolLoading}
          />
        </div>
      </div>
    </div>
  );
}

function PersonalInfoForm({
  values,
  onChange,
  user,
  isOrgAdmin,
  isSmriAdmin,
  schoolData,
  schoolLoading,
}) {
  return (
    <div className="max-w-3xl">
      <div className="mb-8 pb-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Personal Info</h2>
        <p className="text-gray-500 text-sm">Update your personal details</p>
      </div>

      <div className="space-y-8">
        {/* Your photo */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-100">
          <label className="w-full md:w-1/4 text-gray-500 font-medium text-sm">
            Your photo
          </label>
          <div className="flex-1 flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
              {user?.profileImage || user?.photoURL || user?.avatar ? (
                <Image
                  src={user.profileImage || user.photoURL || user.avatar}
                  alt={user?.fullName || "User avatar"}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-gray-600">
                  {(user?.fullName || user?.email || "U")[0]?.toUpperCase()}
                </span>
              )}
            </div>

            <label
              htmlFor="profilePhoto"
              className="px-6 py-2 border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 bg-white cursor-pointer transition-colors"
            >
              Choose
              <input
                id="profilePhoto"
                type="file"
                className="hidden"
                accept="image/*"
              />
            </label>
            <span className="text-gray-400 text-sm">JPG or PNG. 1MB max</span>
          </div>
        </div>

        {/* First & Last Name */}
        <div className="flex flex-col md:flex-row gap-6 pb-8 border-b border-gray-100">
          <div className="flex-1">
            <label className="block text-gray-500 font-medium text-sm mb-2">
              First Name
            </label>
            <Input
              name="firstName"
              value={values.firstName}
              onChange={onChange}
              placeholder="Johny"
              className="w-full rounded-xl border-gray-200 bg-white px-4 py-6 text-base focus-visible:ring-cyan-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-500 font-medium text-sm mb-2">
              Last Name
            </label>
            <Input
              name="lastName"
              value={values.lastName}
              onChange={onChange}
              placeholder="Jackson"
              className="w-full rounded-xl border-gray-200 bg-white px-4 py-6 text-base focus-visible:ring-cyan-500"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-100">
          <label className="w-full md:w-1/4 text-gray-500 font-medium text-sm">
            Email
          </label>
          <div className="flex-1">
            <Input
              name="email"
              type="email"
              value={values.email}
              disabled
              readOnly
              className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-6 text-base text-gray-500 cursor-not-allowed focus-visible:ring-0"
            />
          </div>
        </div>

        {!isSmriAdmin && (
          <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-100">
            <label className="w-full md:w-1/4 text-gray-500 font-medium text-sm">
              {isOrgAdmin ? "Organization" : "School"} Information
            </label>
            <div className="flex-1 space-y-2">
              <p className="text-gray-900 text-base">
                {schoolData?.name || "—"}
              </p>
              {isOrgAdmin && schoolData?.invite_code && (
                <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg inline-block">
                  <p className="text-xs text-gray-500 mb-1">Invite Code</p>
                  <code className="text-sm font-bold text-cyan-600">
                    {schoolData.invite_code}
                  </code>
                </div>
              )}
              {schoolLoading && (
                <span className="text-xs text-gray-400">
                  Loading school details...
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
