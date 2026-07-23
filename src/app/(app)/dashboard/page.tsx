import type { Metadata } from "next";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "대시보드",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-heading-2">대시보드</h1>
      <Card>
        <p className="text-caption text-ink-muted">
          아직 기록이 없어요. 오답을 기록하면 나의 실수 패턴이 보여요.
        </p>
      </Card>
    </div>
  );
}
