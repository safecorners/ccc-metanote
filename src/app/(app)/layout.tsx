import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { BottomCta } from "@/components/app/bottom-cta";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { verifySession } from "@/lib/dal";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await verifySession();
  const displayName =
    (user.user_metadata.display_name as string | undefined) ?? user.email;

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-hairline bg-canvas">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 text-body-sm">
          <nav className="flex items-center gap-4 sm:gap-5">
            <Link href="/dashboard" className="text-title">
              MetaNote
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center text-ink-secondary"
            >
              대시보드
            </Link>
            <Link
              href="/mistakes"
              className="inline-flex min-h-11 items-center text-ink-secondary"
            >
              오답
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-ink-secondary sm:inline">
              {displayName}
            </span>
            <form action={signOut}>
              <Button variant="utility" type="submit" className="min-h-11">
                로그아웃
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-28 md:pb-6">
        {children}
      </main>
      <BottomCta />
      <Toaster />
    </>
  );
}
