import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
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
          <Link href="/dashboard" className="text-title">
            MetaNote
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-ink-secondary">{displayName}</span>
            <form action={signOut}>
              <Button variant="utility" type="submit">
                로그아웃
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {children}
      </main>
    </>
  );
}
