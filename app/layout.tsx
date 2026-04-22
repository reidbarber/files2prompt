import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://reidbarber.github.io/files2prompt/"),
  title: "Files2Prompt - Convert files to LLM prompts",
  description:
    "Convert files (like source code) to formatted LLM prompts (like markdown). Copy the generated prompt to your clipboard automatically.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Files2Prompt",
    description: "Convert code or text files to prompts",
    type: "website",
    url: "https://reidbarber.github.io/files2prompt/",
    images: [
      {
        url: "/og-image.png",
        alt: "Files2Prompt",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className + " overflow-hidden"}>
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
