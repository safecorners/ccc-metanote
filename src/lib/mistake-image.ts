import { createClient } from "@/lib/supabase/client";

// 문제 사진 업로드 — 브라우저 전용 (canvas 압축 후 supabase-js로 직접 업로드).
// 파일 바이트가 서버 액션을 거치지 않으므로 body limit과 무관하다.

export const MISTAKE_IMAGE_BUCKET = "mistake-images";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

/** 최대 변 1600px JPEG로 재인코딩 — 디코드 불가 포맷(HEIC 등)은 원본 그대로 */
async function compressImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    return blob ?? file;
  } catch {
    return file;
  }
}

export async function uploadMistakeImage(
  file: File,
): Promise<{ path: string } | { error: string }> {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return { error: "로그인이 필요해요. 새로고침 후 다시 시도해 주세요" };
  }

  const blob = await compressImage(file);
  const ext = EXTENSIONS[blob.type] ?? "jpg";
  const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(MISTAKE_IMAGE_BUCKET)
    .upload(path, blob, { contentType: blob.type || "image/jpeg" });

  if (error) {
    return { error: "사진 업로드에 실패했어요. 잠시 후 다시 시도해 주세요" };
  }
  return { path };
}

/** 베스트에포트 삭제 — 저장 실패 롤백·사진 교체 시 옛 파일 정리용 */
export async function removeMistakeImage(path: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.storage.from(MISTAKE_IMAGE_BUCKET).remove([path]);
  } catch {
    // 남은 고아 객체는 비공개 버킷이라 노출되지 않는다
  }
}
