"use client";

import { useContext, useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/AuthContext";
import { updateUserProfile, getAvatarUploadUrl, setUserAvatar } from "@/lib/user-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetSchool, useChangePassword } from "@/hooks/auth-api";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("personal");

  const isOrgAdmin = (user?.role || "").toLowerCase() === "school_admin";
  const isSmriAdmin = (user?.role || "").toLowerCase() === "smri_admin";

  const { data: schoolData, isLoading: schoolLoading } = useGetSchool(
    isOrgAdmin && !isSmriAdmin
  );

  const initialPersonalValues = useMemo(
    () => ({
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      email: user?.email || "",
    }),
    [user]
  );

  const [personalForm, setPersonalForm] = useState(initialPersonalValues);

  // Update form when user/school data loads
  useEffect(() => {
    setPersonalForm(initialPersonalValues);
  }, [initialPersonalValues]);

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

  const handlePersonalSave = async (e) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      first_name: personalForm.firstName,
      last_name: personalForm.lastName,
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden min-h-[600px]">
      {/* Top header with title & Tabs */}
      <div className="flex flex-col gap-6 px-4 py-6 sm:px-8 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account preferences</p>
        </div>

        <div className="flex items-center gap-6 border-b border-gray-100 -mb-px">
          <button
            onClick={() => setActiveTab("personal")}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === "personal"
                ? "text-cyan-600 border-b-2 border-cyan-500"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === "password"
                ? "text-cyan-600 border-b-2 border-cyan-500"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Password
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-8 max-w-3xl">
        {activeTab === "personal" ? (
          <PersonalInfoForm
            values={personalForm}
            onChange={handlePersonalChange}
            onSave={handlePersonalSave}
            isLoading={updateProfileMutation.isPending}
            user={user}
            isOrgAdmin={isOrgAdmin}
            isSmriAdmin={isSmriAdmin}
            schoolData={schoolData}
            schoolLoading={schoolLoading}
          />
        ) : (
          <PasswordForm />
        )}
      </div>
    </div>
  );
}

function PersonalInfoForm({
  values,
  onChange,
  onSave,
  isLoading,
  user,
  isOrgAdmin,
  isSmriAdmin,
  schoolData,
  schoolLoading,
}) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error("File is too large (max 2MB)");
      return;
    }
    
    // Allowed types
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
       toast.error("Invalid file type. Use JPG, PNG, WEBP or GIF.");
       return;
    }

    try {
      setIsUploading(true);
      // 1. Get presigned URL
      const { url, fields, object_key } = await getAvatarUploadUrl(file.type);
      
      // 2. Upload to S3
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", file);

      const uploadRes = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      // 3. Update user profile
      await setUserAvatar(object_key);
      
      // 4. Refresh
      await queryClient.invalidateQueries(["me"]);
      toast.success("Profile photo updated");
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile photo");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* User Photo */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-100">
        <label className="w-full md:w-1/4 text-gray-500 font-medium text-sm">
          Your photo
        </label>
        <div className="flex-1 flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
              {isUploading ? (
                 <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              ) : (user?.profileImage || user?.photoURL || user?.avatar || user?.avatar_cdn_url) ? (
                <Image
                  src={user.profileImage || user.photoURL || user.avatar || user.avatar_cdn_url}
                  alt={user?.fullName || "User avatar"}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-gray-500">
                  {(user?.fullName || user?.email || "U")[0]?.toUpperCase()}
                </span>
              )}
            </div>

            <label
              htmlFor="profilePhoto"
              className={`px-6 py-2 border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 bg-white cursor-pointer transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {isUploading ? 'Uploading...' : 'Choose'}
              <input
                id="profilePhoto"
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
            <span className="text-gray-400 text-sm">JPG or PNG. 2MB max</span>
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-gray-100">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">First Name</label>
          <Input
            name="firstName"
            value={values.firstName}
            onChange={onChange}
            className="rounded-xl border-gray-200 py-6"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Last Name</label>
          <Input
            name="lastName"
            value={values.lastName}
            onChange={onChange}
            className="rounded-xl border-gray-200 py-6"
          />
        </div>
      </div>

      {/* Email Readonly */}
      <div className="pb-8 border-b border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <Input
            value={values.email}
            disabled
            className="rounded-xl border-gray-200 bg-gray-50 py-6 text-gray-500"
          />
      </div>

       {/* School/Org Info */}
        {!isSmriAdmin && (
          <div className="pb-8 border-b border-gray-100">
             <label className="block text-sm font-medium text-gray-700 mb-2">{isOrgAdmin ? "Organization" : "School"}</label>
             <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                {schoolLoading ? (
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin"/> Loading...
                    </span>
                ) : (
                    <div className="space-y-1">
                        <p className="font-medium text-gray-900">{schoolData?.name || "—"}</p>
                        {isOrgAdmin && schoolData?.invite_code && (
                             <p className="text-xs text-gray-500">
                                Invite Code: <span className="font-mono font-bold text-cyan-600">{schoolData.invite_code}</span>
                             </p>
                        )}
                    </div>
                )}
             </div>
          </div>
        )}

      <div className="flex justify-end pt-4">
        <Button
          onClick={onSave}
          disabled={isLoading || isUploading}
          className="bg-cyan-500 hover:bg-cyan-600 text-black rounded-full px-8 py-6"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function PasswordForm() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const changePasswordMutation = useChangePassword();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.newPassword.length < 8) {
       toast.error("Password must be at least 8 characters");
       return;
    }

    changePasswordMutation.mutate(
      {
        current_password: form.currentPassword,
        new_password: form.newPassword,
      },
      {
        onSuccess: () => {
          toast.success("Password updated successfully");
          setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        },
        onError: (err) => {
          toast.error(err.message || "Failed to change password");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md animate-in fade-in duration-500">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Current Password</label>
        <Input
          type="password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          required
          className="rounded-xl border-gray-200 py-6"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">New Password</label>
        <Input
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          required
          className="rounded-xl border-gray-200 py-6"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Confirm Password</label>
        <Input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          className="rounded-xl border-gray-200 py-6"
        />
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          disabled={changePasswordMutation.isPending}
          className="bg-cyan-500 hover:bg-cyan-600 text-black rounded-full px-8 py-6 w-full sm:w-auto"
        >
          {changePasswordMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Update Password
        </Button>
      </div>
    </form>
  );
}
