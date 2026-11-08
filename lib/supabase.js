import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const IMAGE_BUCKET = "specimen-images";

export function imageUrl(path) {
  if (!path) return null;
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}
