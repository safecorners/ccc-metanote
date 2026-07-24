import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ErrorTypeBadge } from "@/components/mistakes/error-type-badge";
import { getMistake, getMistakeImageUrl, getUnits } from "@/lib/queries";
import { EditMistakeForm } from "./edit-mistake-form";

export const metadata: Metadata = {
  title: "오답 상세",
};

/** "2026-07-24" → "7월 24일" */
function formatDate(isoDate: string) {
  const [, month, day] = isoDate.split("-").map(Number);
  return `${month}월 ${day}일`;
}

export default async function MistakeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [mistake, units] = await Promise.all([getMistake(id), getUnits()]);

  // 미존재·타인 행(RLS로 0행)은 동일하게 404
  if (!mistake) notFound();

  const imageUrl = mistake.image_path
    ? await getMistakeImageUrl(mistake.image_path)
    : null;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/mistakes"
          className="inline-flex min-h-11 items-center gap-1 self-start text-button text-ink-secondary"
        >
          <ChevronLeft aria-hidden className="size-4" />
          목록으로
        </Link>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-heading-2">{mistake.unit.name}</h1>
            <p className="text-caption text-ink-faint">
              중{mistake.unit.grade} · {formatDate(mistake.mistake_date)}
              {mistake.resolved && " · 극복 완료"}
            </p>
          </div>
          <ErrorTypeBadge errorType={mistake.error_type} />
        </div>
      </div>

      <EditMistakeForm mistake={mistake} units={units} imageUrl={imageUrl} />
    </div>
  );
}
