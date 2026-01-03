// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Provider from "./provider";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // Added more weights for better UI
});

export const metadata: Metadata = {
  title: "Talk2Hire",
  description: "AI-Powered Interview Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <body className={`${outfit.variable} antialiased`} suppressHydrationWarning>
        <Provider>
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}