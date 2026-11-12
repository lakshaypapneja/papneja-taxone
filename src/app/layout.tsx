import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Papneja Associates TaxOne | AI Accounting & Tax Practice Automation",
  description: "Automate bank entries into Tally, GSTR-2B reconciliations, invoice OCR, and practice management for CAs and businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
