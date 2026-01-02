"use client";

import { createContext, useEffect, useState } from "react";
import { useGetProfile, useGetSchool } from "@/hooks/auth-api";
import { useQueryClient } from "@tanstack/react-query";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [accountType, setAccountType] = useState(null); // "user" | "organization"
  const queryClient = useQueryClient(); // Get client

  // Load token from localStorage on first render
  useEffect(() => {
    const t = localStorage.getItem("auth_token");
    const at = localStorage.getItem("auth_account_type");
    if (t) setToken(t);
    if (at) setAccountType(at);
    setInitializing(false);
  }, []);

  const isOrg = (accountType || "").toLowerCase() === "organization";

  // Fetch user profile for normal users
  const { data: profileUser, isLoading: profileLoading } = useGetProfile(
    Boolean(token) && !isOrg
  );

  // Fetch school profile for organization accounts
  const { data: school, isLoading: schoolLoading } = useGetSchool(
    Boolean(token) && isOrg
  );

  const derivedUser = isOrg
    ? school
      ? {
          ...school,
          fullName: school.name,
          role: "school_admin",
          type: "organization",
          school_id: school.school_id,
        }
      : null
    : profileUser;

  const login = (userData, token, accountTypeArg = "user") => {
    setToken(token);
    localStorage.setItem("auth_token", token);
    setAccountType(accountTypeArg);
    localStorage.setItem("auth_account_type", accountTypeArg);

    // Normalise user shape for the rest of the app
    if (userData) {
      const fullName =
        userData.fullName ||
        `${userData.first_name || ""} ${userData.last_name || ""}`.trim();

      const normalizedUser = {
        ...userData,
        fullName,
        type: userData.type || userData.role || null,
      };

      // Immediately set the user data in the cache so the UI updates instantly
      queryClient.setQueryData(["me"], normalizedUser);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user: derivedUser,
        token,
        loading: (isOrg ? schoolLoading : profileLoading) || initializing, // combine loading states
        accountType,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
