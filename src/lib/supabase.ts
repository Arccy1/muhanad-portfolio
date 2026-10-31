// Supabase Storage helper — uploads media to a public bucket using the
// REST API. No @supabase/supabase-js dependency needed.
//
// Required .env variables (set in Vercel + local .env):
//   SUPABASE_URL       e.g. https://xxx.supabase.co
//   SUPABASE_SERVICE_KEY  service_role key (server-side only, never expose)
//   SUPABASE_BUCKET    e.g. media

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
export const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "media";

export function isStorageConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY);
}

/** Upload a file buffer to Supabase Storage. Returns the public URL. */
export async function uploadToSupabase(
  buffer: Buffer,
  filename: string,
  contentType: string,
  folder = "media"
): Promise<{ url: string; path: string }> {
  const supabaseUrl = SUPABASE_URL.replace(/\/$/, "");
  const objectPath = `${folder}/${filename}`;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${SUPABASE_BUCKET}/${objectPath}`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase upload failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${SUPABASE_BUCKET}/${objectPath}`;
  return { url: publicUrl, path: objectPath };
}

/** Delete a file from Supabase Storage. */
export async function deleteFromSupabase(objectPath: string): Promise<boolean> {
  const supabaseUrl = SUPABASE_URL.replace(/\/$/, "");
  const res = await fetch(`${supabaseUrl}/storage/v1/object/${SUPABASE_BUCKET}/${objectPath}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
  });
  return res.ok;
}
