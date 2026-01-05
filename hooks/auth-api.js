"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

// Helper to simplify fetch to Next.js API routes (JSON by default)
async function apiFetch(url, options = {}) {
  // Attach auth token from localStorage when running in the browser
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  console.log(data, "data");

  return data;
}


/* -------------------- AUTH MUTATIONS -------------------- */

export function useLogin() {
  return useMutation({
    mutationFn: (payload) =>
      apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload) =>
      apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (payload) =>
      apiFetch("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: (payload) =>
      apiFetch("/api/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload) =>
      apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload) =>
      apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}

/* -------------------- PROFILE QUERY -------------------- */

export function useGetProfile(enabled = true) {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch("/api/auth/me"),
    enabled,
    retry: 1,
  });
}

export function useGetSchool(enabled = true) {
  console.log("called the map function")
  return useQuery({
    queryKey: ["school"],
    queryFn: () => apiFetch("/api/auth/school"),
    enabled,
    retry: 1,
  });
}


