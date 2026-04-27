import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "INTENTSHIELD Mission Control",
  description: "High-performance intent security dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="relative min-h-screen">
        <div className="scanlines absolute inset-0 pointer-events-none"></div>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
