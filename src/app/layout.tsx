import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@/shared/components/ui/toaster";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Secure Media Access",
  description: "Time-restricted private media access",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
