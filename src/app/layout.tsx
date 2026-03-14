import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";
import { LocaleProvider } from "@/context/LocaleContext";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const tajawal = Tajawal({
  weight: ["400", "500", "700", "800"],
  subsets: ["arabic", "latin"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "يوم اشهارنا إن شاء الله | عمر ومنة",
  description: "عدّ تنازلي ليوم الاشهار — عمر الإمام ومنة أبو جبل",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} ${tajawal.variable} font-sans antialiased min-h-screen`}>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
