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

import { getAllActiveSubcategorias } from '@/features/subcategorias/subcategoria.service';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const subcategoriaMap = await getAllActiveSubcategorias();

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={montserrat.className} suppressHydrationWarning>
        <Navbar />
        <FiltrosWrapper subcategoriaMap={subcategoriaMap} />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
