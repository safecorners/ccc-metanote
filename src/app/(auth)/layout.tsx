import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <Link href="/" className="text-heading-3">
        MetaNote
      </Link>
      <Card elevated className="w-full max-w-sm rounded-xl">
        {children}
      </Card>
    </div>
  );
}
