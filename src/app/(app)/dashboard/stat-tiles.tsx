import { CircleCheck, Flame, NotebookPen } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Stats } from "@/lib/aggregate";
import { cn } from "@/lib/utils";

/** 게이미피케이션-lite 스탯 타일 — 별도 테이블 없이 mistakes에서 파생 */
export function StatTiles({ stats }: { stats: Stats }) {
  const tiles = [
    {
      icon: Flame,
      label: "주 연속 기록",
      value: `${stats.streak}주`,
      iconClassName: "text-accent-orange",
    },
    {
      icon: NotebookPen,
      label: "누적 기록",
      value: `${stats.total}개`,
      iconClassName: "text-ink-muted",
    },
    {
      icon: CircleCheck,
      label: "극복 완료",
      value: `${stats.resolvedCount}개`,
      iconClassName: "text-accent-green",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 md:col-span-2 md:gap-4">
      {tiles.map((tile) => (
        <Card
          key={tile.label}
          className="flex flex-col gap-1.5 p-4 md:flex-row md:items-center md:gap-3"
        >
          <tile.icon aria-hidden className={cn("size-5", tile.iconClassName)} />
          <div className="flex flex-col">
            <span className="text-heading-3 tabular-nums">{tile.value}</span>
            <span className="text-caption text-ink-muted">{tile.label}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
