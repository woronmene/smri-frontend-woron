"use client";

import { useState } from "react";
import {
  useLogin,
  useRegister,
  useVerifyOtp,
  useForgotPassword,
  useResetPassword,
  useGetProfile,
} from "@/hooks/auth-api";

export default function TestAuthPage() {
  const { data: profile, error: profileError, refetch: refetchProfile } = useGetProfile();
  
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Auth API Test Page</h1>

      {/* Profile Section */}
      <section className="p-6 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-bold mb-4">Current Session (useGetProfile)</h2>
        <div className="space-y-2">
          <button 
            onClick={() => refetchProfile()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refetch Profile
          </button>
          <pre className="bg-white p-4 rounded overflow-auto max-h-40 text-sm">
            {JSON.stringify({ profile, error: profileError?.message }, null, 2)}
          </pre>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <LoginForm />
        <RegisterForm />
        <VerifyOtpForm />
        <ForgotPasswordForm />
        <ResetPasswordForm />
      </div>
    </div>
  );
}

function LoginForm() {
  const login = useLogin();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    login.mutate(formData);
  };

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <button 
          type="submit" 
          disabled={login.isPending}
          className="w-full px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
        >
          {login.isPending ? "Logging in..." : "Login"}
        </button>
      </form>
      {login.data && <div className="mt-4 text-green-600 text-sm">Success: {JSON.stringify(login.data)}</div>}
      {login.error && <div className="mt-4 text-red-600 text-sm">Error: {login.error.message}</div>}
    </div>
  );
}

function RegisterForm() {
  const register = useRegister();
  
  
  const [formData, setFormData] = useState({ 
    first_name: "", 
    last_name: "", 
    email: "", 
    password: "", 
    invite_code: "INVITE123", // Default to a likely valid one or placeholder
    type: "individual" 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    register.mutate(formData);
  };

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            className="w-full p-2 border rounded"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Last Name"
            className="w-full p-2 border rounded"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          />
        </div>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <input
          type="text"
          placeholder="Invite Code"
          className="w-full p-2 border rounded"
          value={formData.invite_code}
          onChange={(e) => setFormData({ ...formData, invite_code: e.target.value })}
        />
        <select
          className="w-full p-2 border rounded"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        >
          <option value="individual">Individual</option>
          <option value="business">Business</option>
        </select>
        <button 
          type="submit" 
          disabled={register.isPending}
          className="w-full px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          {register.isPending ? "Registering..." : "Register"}
        </button>
      </form>
      {register.data && <div className="mt-4 text-green-600 text-sm">Success: {JSON.stringify(register.data)}</div>}
      {register.error && <div className="mt-4 text-red-600 text-sm">Error: {register.error.message}</div>}
    </div>
  );
}

function VerifyOtpForm() {
  const verify = useVerifyOtp();
  const [formData, setFormData] = useState({ email: "", otp: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    verify.mutate(formData);
  };

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Verify OTP</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="OTP Code"
          className="w-full p-2 border rounded"
          value={formData.otp}
          onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
        />
        <button 
          type="submit" 
          disabled={verify.isPending}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
        >
          {verify.isPending ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
      {verify.data && <div className="mt-4 text-green-600 text-sm">Success: {JSON.stringify(verify.data)}</div>}
      {verify.error && <div className="mt-4 text-red-600 text-sm">Error: {verify.error.message}</div>}
    </div>
  );
}

function ForgotPasswordForm() {
  const forgot = useForgotPassword();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    forgot.mutate({ email });
  };

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={forgot.isPending}
          className="w-full px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
        >
          {forgot.isPending ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      {forgot.data && <div className="mt-4 text-green-600 text-sm">Success: {JSON.stringify(forgot.data)}</div>}
      {forgot.error && <div className="mt-4 text-red-600 text-sm">Error: {forgot.error.message}</div>}
    </div>
  );
}

function ResetPasswordForm() {
  const reset = useResetPassword();
  const [formData, setFormData] = useState({ token: "", newPassword: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    reset.mutate(formData);
  };

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Reset Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Reset Token"
          className="w-full p-2 border rounded"
          value={formData.token}
          onChange={(e) => setFormData({ ...formData, token: e.target.value })}
        />
        <input
          type="password"
          placeholder="New Password"
          className="w-full p-2 border rounded"
          value={formData.newPassword}
          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
        />
        <button 
          type="submit" 
          disabled={reset.isPending}
          className="w-full px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
        >
          {reset.isPending ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      {reset.data && <div className="mt-4 text-green-600 text-sm">Success: {JSON.stringify(reset.data)}</div>}
      {reset.error && <div className="mt-4 text-red-600 text-sm">Error: {reset.error.message}</div>}
    </div>
  );
}
