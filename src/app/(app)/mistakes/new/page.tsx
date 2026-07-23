import type { Metadata } from "next";
import { getProfile, getUnits } from "@/lib/queries";
import { MistakeForm } from "./mistake-form";

export const metadata: Metadata = {
  title: "오답 기록",
};

export default async function NewMistakePage() {
  const [units, profile] = await Promise.all([getUnits(), getProfile()]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <h1 className="text-heading-2">오답 기록</h1>
      <MistakeForm units={units} defaultGrade={profile.grade} />
    </div>
  );
}
