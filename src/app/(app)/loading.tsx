import { Card } from "@/components/ui/card";

export default function AppLoading() {
  return (
    <div className="flex flex-col gap-4" aria-label="불러오는 중" role="status">
      <div className="h-8 w-40 animate-pulse rounded-md bg-canvas-soft" />
      <Card className="h-48 animate-pulse bg-canvas-soft" />
      <Card className="h-48 animate-pulse bg-canvas-soft" />
    </div>
  );
}
