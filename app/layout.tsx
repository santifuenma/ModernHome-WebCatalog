import type { Metadata } from "next";

import { Montserrat } from "next/font/google";
import Navbar from '@/components/layout/Navbar';
import FiltrosWrapper from '@/components/layout/FiltrosWrapper';
import './globals.css';

const montserrat = Montserrat({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Modern Home Catalog",
  description: "Modern Home Catalog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={montserrat.className} suppressHydrationWarning>
        <Navbar />
        <FiltrosWrapper />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
