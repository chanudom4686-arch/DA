import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "Apartment Management",
  description: "Modern Apartment Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning className={cn("font-sans", geist.variable, inter.variable)}>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground" suppressHydrationWarning>
        <div className="relative flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-8 flex h-16 items-center justify-between">
              <div className="flex gap-6 md:gap-10">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="inline-block font-bold text-xl text-primary">🏢 APM System</span>
                </Link>
                <nav className="flex gap-6">
                  <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    หน้าหลัก
                  </Link>
                  <Link href="/invoices" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    รวมบิล
                  </Link>
                  <Link href="/reports" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    รายงาน
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 sm:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
