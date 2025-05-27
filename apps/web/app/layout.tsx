import type { Metadata } from "next";

import "./globals.css";
import { Toaster } from "sonner";
import Header from "@/src/components/Header";

export const metadata: Metadata = {
  title: "Numio.ai",
  description: "Numio.ai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" />
        <Header />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
