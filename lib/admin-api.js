
// Helper for admin-scoped requests
const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || "https://0qdrpi2zhe.execute-api.us-east-1.amazonaws.com";

// Only for client-side usage in authorized dashboard pages
export async function getSchools() {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    
    if (!token) return [];

    const res = await fetch(`${USER_SERVICE_URL}/admin/schools`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch schools");
    }

    return res.json();
}
