import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ARIGATO | Momentos felices",
  description: "Tienda online ARIGATO Momentos Felices",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
