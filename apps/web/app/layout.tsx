import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skill Loop",
  description: "Community skill exchange and business skill platform"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
