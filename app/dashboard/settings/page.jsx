"use client";

import { useContext, useMemo, useState } from "react";
import Image from "next/image";
import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("personal");

  const initialPersonalValues = useMemo(
    () => ({
      fullName: user?.fullName || "",
      email: user?.email || "",
      school: "Middle High School",
      phone: "",
      dob: "",
    }),
    [user]
  );

  const [personalForm, setPersonalForm] = useState(initialPersonalValues);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
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

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: Wire up to profile update API when available
    // For now this is a presentational form that matches the design.
    console.log("Save settings clicked", { personalForm, passwordForm });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Top header with title & actions */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-gray-300"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Left tab navigation */}
        <div className="w-64 border-r border-gray-200 bg-white p-6">
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
        <div className="flex-1 p-10">
          {activeTab === "personal" ? (
            <PersonalInfoForm
              values={personalForm}
              onChange={handlePersonalChange}
              user={user}
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

function PersonalInfoForm({ values, onChange, user }) {
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

        {/* Full name */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-100">
          <label className="w-full md:w-1/4 text-gray-500 font-medium text-sm">
            Full Name
          </label>
          <div className="flex-1">
            <Input
              name="fullName"
              value={values.fullName}
              onChange={onChange}
              placeholder="Johny Jackson"
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

        {/* School information */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-100">
          <label className="w-full md:w-1/4 text-gray-500 font-medium text-sm">
            School Information
          </label>
          <div className="flex-1">
            <p className="text-gray-900 text-base">{values.school}</p>
          </div>
        </div>

        {/* Phone number */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-100">
          <label className="w-full md:w-1/4 text-gray-500 font-medium text-sm">
            Phone number
          </label>
          <div className="flex-1">
            <Input
              name="phone"
              value={values.phone}
              onChange={onChange}
              placeholder="+1 (809) 561-9072"
              className="w-full rounded-xl border-gray-200 bg-white px-4 py-6 text-base focus-visible:ring-cyan-500"
            />
          </div>
        </div>

        {/* Date of birth */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-2">
          <label className="w-full md:w-1/4 text-gray-500 font-medium text-sm">
            Date of birth
          </label>
          <div className="flex-1">
            <div className="relative">
              <Input
                name="dob"
                value={values.dob}
                onChange={onChange}
                placeholder="10 February 1996"
                className="w-full rounded-xl border-gray-200 bg-white px-4 py-6 text-base pr-11 focus-visible:ring-cyan-500"
              />
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
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
