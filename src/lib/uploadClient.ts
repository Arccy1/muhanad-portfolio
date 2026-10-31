"use client";

/**
 * Uploads a file from the admin panel and returns its public URL.
 *
 * - Small files (≤ 3 MB) go through /api/upload (works with the local
 *   filesystem fallback when Supabase isn't configured).
 * - Larger files would hit Vercel's 4.5 MB serverless body limit, so the
 *   server first issues a short-lived signed upload URL and the browser
 *   sends the file straight to Supabase Storage.
 */
export async function uploadFile(file: File): Promise<string> {
  if (file.size <= 3 * 1024 * 1024) {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Upload failed.");
    return data.url as string;
  }

  const signRes = await fetch("/api/upload/signed-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });
  const signed = await signRes.json().catch(() => null);
  if (!signRes.ok) throw new Error(signed?.error || "Could not prepare the upload.");

  // Supabase's signed-upload endpoint expects a PUT with the raw file body —
  // no Authorization header (the token in the URL authorizes this one object).
  const up = await fetch(signed.uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });
  if (!up.ok) {
    const text = await up.text().catch(() => "");
    throw new Error(`Upload failed (${up.status})${text ? ": " + text.slice(0, 120) : ""}`);
  }
  return signed.publicUrl as string;
}
