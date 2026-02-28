import type { Metadata } from "next";

import Navbar from '@/components/layout/Navbar';

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
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
