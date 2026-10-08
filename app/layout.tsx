import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARIGATO | Momentos felices",
  description:
    "ARIGATO Momentos Felices — souvenirs personalizados, fotolibros y detalles para celebrar momentos especiales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
