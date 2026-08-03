import React from "react";
import "@/app/globals.css";
import { headers } from "next/headers";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/app/providers";
import { InlineScript } from "@/components/inline-script";
import { THEME_STORAGE_KEY } from "@/lib/theme";

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const description =
  "RHV Hospital's internal system for logging and reporting workplace death occurrences following incidents or treatment episodes.";

export const metadata = {
  title: "Death Report",
  description,
  robots: { index: false, follow: false },
  openGraph: {
    title: "Death Report — RHV Hospital",
    description,
    images: ["/images/rhv logo.png"],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Death Report — RHV Hospital",
    description,
    images: ["/images/rhv logo.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <InlineScript
          nonce={nonce}
          html={`(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`}
        />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster closeButton position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
