import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "りーどみー",
  description: "Created with v0",
  generator: "v0.app",
  icons: {
    icon: "../public/read_me_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} antialiased`}>
        {" "}
        {children}
        <Analytics />
      </body>
    </html>
  );
}
