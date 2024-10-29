"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useState(() => {
    if (!globalThis) return;
    const originalFetch = globalThis.window.fetch;
    globalThis.window.fetch = (url, options = {}) => {
      const newOptions: Record<string, any> = {
        ...options,
        credentials: "include",
      };
      return originalFetch(url, newOptions);
    };
  });
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
