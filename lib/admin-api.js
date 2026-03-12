
// Helper for admin-scoped requests
const USER_SERVICE_URL =
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "https://0qdrpi2zhe.execute-api.us-east-1.amazonaws.com";

// Only for client-side usage in authorized dashboard pages
export async function getSchools() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  if (!token) return [];

  const res = await fetch(`${USER_SERVICE_URL}/admin/schools`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch schools");
  }

  return res.json();
}

export async function resendSchoolInvite(schoolId) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(
    `${USER_SERVICE_URL}/admin/schools/${encodeURIComponent(
      schoolId,
    )}/resend-invite`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    let message = "Failed to resend invite";
    try {
      const data = await res.json();
      message = data.detail || data.message || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return res.json();
}
