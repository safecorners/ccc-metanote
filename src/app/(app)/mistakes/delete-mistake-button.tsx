"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteMistake } from "./actions";

export function DeleteMistakeButton({
  id,
  summary,
}: {
  id: string;
  /** 다이얼로그에 보여줄 기록 요약 (예: "일차방정식 · 계산 실수") */
  summary: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="min-h-11 rounded-md px-2.5 text-caption text-ink-faint transition hover:bg-canvas-soft hover:text-ink-secondary"
        >
          삭제
        </button>
      </DialogTrigger>
      <DialogContent className="bg-surface p-6">
        <DialogHeader>
          <DialogTitle className="text-heading-3 text-ink">
            오답 기록을 삭제할까요?
          </DialogTitle>
          <DialogDescription className="text-body-sm text-ink-muted">
            {summary} 기록이 완전히 삭제돼요. 되돌릴 수 없어요.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button variant="utility" type="button" className="min-h-11">
              취소
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={pending}
            className="min-h-11"
            onClick={() =>
              startTransition(async () => {
                await deleteMistake(id);
                setOpen(false);
              })
            }
          >
            {pending ? "삭제 중…" : "삭제하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
