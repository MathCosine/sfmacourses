/**
 * Cloudinary unsigned uploads + delivery-URL optimization.
 *
 * Images are uploaded directly from the browser to Cloudinary using an
 * *unsigned* upload preset, so no server round-trip or secret key is needed.
 * Storage lives entirely in Cloudinary (25 GB free tier), never in Supabase.
 *
 * Required public env vars:
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME     — your Cloudinary cloud name
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET  — an *unsigned* upload preset
 */

export const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
export const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export function cloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

/** Upload a single image file and resolve to its hosted secure URL. */
export async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Image uploads aren't configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
    );
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: form },
  );

  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j?.error?.message ? `: ${j.error.message}` : "";
    } catch {
      // ignore — surface a generic message below
    }
    throw new Error(`Upload failed${detail}`);
  }

  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) throw new Error("Upload failed: no URL returned.");
  return data.secure_url;
}

/**
 * Rewrite a Cloudinary delivery URL to auto-format / auto-quality and cap the
 * width, so lesson pages stay light no matter how big the original was.
 * Non-Cloudinary URLs are returned unchanged.
 */
export function optimizedImageUrl(url: string, width = 1600): string {
  if (!url) return url;
  const marker = "/upload/";
  const i = url.indexOf(marker);
  if (!url.includes("res.cloudinary.com") || i === -1) return url;
  const head = url.slice(0, i + marker.length);
  const tail = url.slice(i + marker.length);
  // Avoid double-applying if a transform is already present.
  if (/^(f_|q_|w_|c_)/.test(tail)) return url;
  return `${head}f_auto,q_auto,w_${width},c_limit/${tail}`;
}
