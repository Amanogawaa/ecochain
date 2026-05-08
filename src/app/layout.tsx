import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import AppConvexProvider from "./ConvexProvider";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EcoChain",
  description: "Transparent community resource sharing for sustainable cities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--eco-base)] text-[var(--eco-ink)]">
        <AppConvexProvider>{children}</AppConvexProvider>
      </body>
    </html>
  );
}
