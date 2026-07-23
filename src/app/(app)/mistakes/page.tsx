import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ErrorTypeBadge } from "@/components/mistakes/error-type-badge";
import { getMistakes } from "@/lib/queries";
import { getErrorType } from "@/lib/taxonomy";
import type { MistakeWithUnit } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toggleMistakeResolved } from "./actions";
import { DeleteMistakeButton } from "./delete-mistake-button";

export const metadata: Metadata = {
  title: "오답 목록",
};

/** "2026-07-24" → "7월 24일" */
function formatDate(isoDate: string) {
  const [, month, day] = isoDate.split("-").map(Number);
  return `${month}월 ${day}일`;
}

function ResolveToggle({ mistake }: { mistake: MistakeWithUnit }) {
  return (
    <form action={toggleMistakeResolved.bind(null, mistake.id, !mistake.resolved)}>
      <button
        type="submit"
        aria-pressed={mistake.resolved}
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-1 text-eyebrow transition",
          mistake.resolved
            ? "bg-accent-green/10 text-accent-green"
            : "border border-hairline bg-surface text-ink-secondary",
        )}
      >
        <Check aria-hidden className="size-3.5" />
        {mistake.resolved ? "극복 완료" : "극복하기"}
      </button>
    </form>
  );
}

function summaryOf(mistake: MistakeWithUnit) {
  return `${mistake.unit.name} · ${getErrorType(mistake.error_type).label}`;
}

export default async function MistakesPage() {
  const mistakes = await getMistakes();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-2">오답 목록</h1>
        <LinkButton href="/mistakes/new">오답 기록</LinkButton>
      </div>

      {mistakes.length === 0 ? (
        <Card className="flex flex-col items-start gap-4 bg-canvas-soft p-8">
          <p className="text-body-md text-ink-secondary">
            아직 기록한 오답이 없어요. 오답을 3개만 기록하면 나의 실수 패턴이
            보여요.
          </p>
          <LinkButton href="/mistakes/new" variant="utility">
            첫 오답 기록하기
          </LinkButton>
        </Card>
      ) : (
        <>
          {/* 모바일 — note-card 리스트 */}
          <ul className="flex flex-col gap-3 md:hidden">
            {mistakes.map((mistake) => (
              <li key={mistake.id}>
                <Card className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-title">{mistake.unit.name}</span>
                      <span className="text-caption text-ink-faint">
                        중{mistake.unit.grade} ·{" "}
                        {formatDate(mistake.mistake_date)}
                        {mistake.source && ` · ${mistake.source}`}
                        {mistake.problem_ref && ` · ${mistake.problem_ref}`}
                      </span>
                    </div>
                    <ErrorTypeBadge errorType={mistake.error_type} />
                  </div>
                  {mistake.memo && (
                    <p className="text-body-sm text-ink-secondary">
                      {mistake.memo}
                    </p>
                  )}
                  <div className="flex items-center justify-between border-t border-hairline pt-3">
                    <ResolveToggle mistake={mistake} />
                    <DeleteMistakeButton
                      id={mistake.id}
                      summary={summaryOf(mistake)}
                    />
                  </div>
                </Card>
              </li>
            ))}
          </ul>

          {/* 데스크톱 — 테이블 */}
          <Card className="hidden overflow-x-auto p-0 md:block">
            <table className="w-full border-collapse text-body-sm">
              <thead>
                <tr className="bg-canvas-soft text-left text-eyebrow text-ink-muted">
                  <th className="px-4 py-3 font-semibold">날짜</th>
                  <th className="px-4 py-3 font-semibold">단원</th>
                  <th className="px-4 py-3 font-semibold">오류 유형</th>
                  <th className="px-4 py-3 font-semibold">출처 / 문제</th>
                  <th className="px-4 py-3 font-semibold">메모</th>
                  <th className="px-4 py-3 font-semibold">극복</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {mistakes.map((mistake) => (
                  <tr
                    key={mistake.id}
                    className="border-t border-hairline align-middle"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-ink-muted tabular-nums">
                      {formatDate(mistake.mistake_date)}
                    </td>
                    <td className="px-4 py-3">
                      {mistake.unit.name}
                      <span className="ml-1.5 text-caption text-ink-faint">
                        중{mistake.unit.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ErrorTypeBadge errorType={mistake.error_type} />
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {[mistake.source, mistake.problem_ref]
                        .filter(Boolean)
                        .join(" / ") || "—"}
                    </td>
                    <td className="max-w-60 truncate px-4 py-3 text-ink-muted">
                      {mistake.memo ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <ResolveToggle mistake={mistake} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteMistakeButton
                        id={mistake.id}
                        summary={summaryOf(mistake)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
