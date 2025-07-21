import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Files2Prompt - Convert files to LLM prompts",
  description:
    "Convert files (like source code) to formatted LLM prompts (like markdown). Copy the generated prompt to your clipboard automatically.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <meta property="og:title" content="Files2Prompt" />
        <meta
          property="og:description"
          content="Convert code or text files to prompts"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://files2prompt.com" />
        <meta property="og:image" content="/og-image.png" />
      </Head>
      <body className={inter.className}>
        {children}
        <Toaster
          toastOptions={{
            style: {
              background: "green",
              color: "white",
            },
            className: "class",
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
