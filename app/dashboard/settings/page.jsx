"use client";

import { useContext, useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/AuthContext";
import { updateUserProfile } from "@/lib/user-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("personal");
  const queryClient = useQueryClient();

  const isOrgAdmin = (user?.role || "").toLowerCase() === "school_admin";
  // School data fetching removed as endpoint is currently restricted
  const school = null;

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

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setPersonalForm(initialPersonalValues);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (activeTab === "personal") {
        updateProfileMutation.mutate({
            first_name: personalForm.firstName,
            last_name: personalForm.lastName,
            // phone/dob ignored by backend
        });
    } else {
        // Password update logic (requires separate implementation if endpoints differ)
        console.log("Password update not explicitly requested yet");
    }
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
        {/* Mobile tab switcher */}
        <div className="md:hidden px-4 pt-3 pb-2 border-b border-gray-200 bg-white flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
              activeTab === "personal"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Personal Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("password")}
            className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
              activeTab === "password"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Password
          </button>
        </div>

        {/* Left tab navigation (desktop) */}
        <div className="hidden md:block w-64 border-r border-gray-200 bg-white p-6">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                activeTab === "personal"
                  ? "bg-[#FAFAFA] border-[#E5E5E5] text-black"
                  : "bg-transparent border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              Personal Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("password")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                activeTab === "password"
                  ? "bg-[#FAFAFA] border-[#E5E5E5] text-black"
                  : "bg-transparent border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              Password
            </button>
          </div>
        </div>

        {/* Right content area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10">
          {activeTab === "personal" ? (
            <PersonalInfoForm
              values={personalForm}
              onChange={handlePersonalChange}
              user={user}
              isOrgAdmin={isOrgAdmin}
            />
          ) : (
            <PasswordForm
              values={passwordForm}
              onChange={handlePasswordChange}
            />
          )}
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
              <label className="block text-gray-500 font-medium text-sm mb-2">First Name</label>
              <Input
                name="firstName"
                value={values.firstName}
                onChange={onChange}
                placeholder="Johny"
                className="w-full rounded-xl border-gray-200 bg-white px-4 py-6 text-base focus-visible:ring-cyan-500"
              />
           </div>
           <div className="flex-1">
              <label className="block text-gray-500 font-medium text-sm mb-2">Last Name</label>
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
              onChange={onChange}
              placeholder="johnyjackson@gmail.com"
              className="w-full rounded-xl border-gray-200 bg-white px-4 py-6 text-base focus-visible:ring-cyan-500"
            />
          </div>
        </div>

        {/* School / Organization information */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-100">
          <label className="w-full md:w-1/4 text-gray-500 font-medium text-sm">
            {isOrgAdmin ? "Organization" : "School"} Information
          </label>
          <div className="flex-1 space-y-2">
            <p className="text-gray-900 text-base">
              {values.school || "—"}
            </p>
          </div>
        </div>


      </div>
    </div>
  );
}

function PasswordForm({ values, onChange }) {
  return (
    <div className="max-w-xl">
      <div className="mb-8 pb-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Password</h2>
        <p className="text-gray-500 text-sm">Update your account password</p>
      </div>

      <div className="space-y-8">
        {/* Current password */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-100">
          <label className="w-full md:w-1/3 text-gray-500 font-medium text-sm">
            Current password
          </label>
          <div className="flex-1">
            <Input
              name="currentPassword"
              type="password"
              value={values.currentPassword}
              onChange={onChange}
              className="w-full rounded-xl border-gray-200 bg-white px-4 py-6 text-base focus-visible:ring-cyan-500"
            />
          </div>
        </div>

        {/* New password */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-100">
          <label className="w-full md:w-1/3 text-gray-500 font-medium text-sm">
            New password
          </label>
          <div className="flex-1">
            <Input
              name="newPassword"
              type="password"
              value={values.newPassword}
              onChange={onChange}
              className="w-full rounded-xl border-gray-200 bg-white px-4 py-6 text-base focus-visible:ring-cyan-500"
            />
          </div>
        </div>

        {/* Confirm password */}
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <label className="w-full md:w-1/3 text-gray-500 font-medium text-sm">
            Confirm new password
          </label>
          <div className="flex-1">
            <Input
              name="confirmPassword"
              type="password"
              value={values.confirmPassword}
              onChange={onChange}
              className="w-full rounded-xl border-gray-200 bg-white px-4 py-6 text-base focus-visible:ring-cyan-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
