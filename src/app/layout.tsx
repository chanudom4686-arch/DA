import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="th" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <nav className="navbar">
          <div className="navbar-container">
            <div className="navbar-brand">
              <Link href="/">🏢 APM System</Link>
            </div>
            <div className="navbar-links">
              <Link href="/">หน้าหลัก</Link>
              <Link href="/invoices">รวมบิล</Link>
              <Link href="/reports">รายงาน</Link>
            </div>
          </div>
        </nav>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
