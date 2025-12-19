"use client";

import { createContext, useEffect, useState } from "react";
import { useGetProfile } from "@/hooks/auth-api";
import { useQueryClient } from "@tanstack/react-query"; // Import QueryClient

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const queryClient = useQueryClient(); // Get client

  // Load token from localStorage on first render
  useEffect(() => {
    const t = localStorage.getItem("auth_token");
    if (t) setToken(t);
    setInitializing(false);
  }, []);

  // Fetches profile only if token exists
  const { data: user, isLoading } = useGetProfile(Boolean(token));

  const login = (userData, token) => {
    setToken(token);
    localStorage.setItem("auth_token", token);
    
    // Immediately set the user data in the cache so the UI updates instantly
    if (userData) {
      queryClient.setQueryData(["me"], userData);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading: isLoading || initializing, // combine loading states
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
