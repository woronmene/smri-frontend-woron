export default function maskEmail(email) {
  if (!email || !email.includes("@")) return email;

  const [local, domain] = email.split("@");
  if (local.length <= 2) {
    // If the local part is very short, just hide one char
    return `${local[0] || "*"}***@${domain}`;
  }

  const visiblePart = local.slice(0, 3);
  const lastVisiblePart = local.slice(-1);
  const hiddenPart = "*".repeat(Math.max(4, local.length - 4));
  return `${visiblePart}${hiddenPart}${lastVisiblePart}@${domain}`;
}
