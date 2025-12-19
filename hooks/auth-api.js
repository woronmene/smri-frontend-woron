"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

// Helper to simplify fetch
async function apiFetch(url, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;
  
  const headers = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");

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

