import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import './globals.css';

const montserrat = Montserrat({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Modern Home Catalog",
  description: "Modern Home Catalog",
};

/**
 * RootLayout
 * Bare shell — just html/body/font/globals.
 * Catalog UI (Navbar, Filtros) lives in app/(catalog)/layout.tsx
 * Admin UI (top bar, logout) lives in app/admin/layout.tsx
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={montserrat.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
