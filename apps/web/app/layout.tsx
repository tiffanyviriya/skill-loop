import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Skill Loop — Ekosistem Pertukaran Keahlian UMKM",
    template: "%s · Skill Loop",
  },
  description:
    "Platform pertukaran keahlian berbasis token untuk komunitas dan UMKM Indonesia. Temukan mentor, ikuti kelas, dan kembangkan bisnis lokal Anda.",
  keywords: ["skill exchange", "UMKM", "mentor", "Indonesia", "kelas online", "token"],
  authors: [{ name: "Skill Loop" }],
  openGraph: {
    title: "Skill Loop — Ekosistem Pertukaran Keahlian UMKM",
    description: "Platform pertukaran keahlian berbasis token untuk komunitas dan UMKM Indonesia.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
