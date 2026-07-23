"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="flex flex-col items-start gap-4 p-8">
      <p className="text-title">문제가 발생했어요</p>
      <p className="text-body-sm text-ink-muted">
        잠시 후 다시 시도해 주세요. 계속 반복되면 새로고침하거나 다시 로그인해
        주세요.
      </p>
      <Button type="button" variant="utility" className="min-h-11" onClick={reset}>
        다시 시도
      </Button>
    </Card>
  );
}
