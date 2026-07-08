"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "No file provided" };
  if (!file.type.startsWith("image/")) return { error: "File must be an image" };
  if (file.size > 4 * 1024 * 1024) return { error: "Image must be under 4MB" };

  const ext = file.name.split(".").pop() ?? "png";
  const path = `avatars/${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("assets")
    .upload(path, file, { contentType: file.type, upsert: true });
  if (uploadError) return { error: uploadError.message };

  const { data: publicUrl } = supabase.storage.from("assets").getPublicUrl(path);
  const avatarUrl = `${publicUrl.publicUrl}?v=${Date.now()}`;

  const { error: dbError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);
  if (dbError) return { error: dbError.message };

  revalidatePath("/admin");
  return { success: true, avatarUrl };
}

export async function removeAvatar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}
