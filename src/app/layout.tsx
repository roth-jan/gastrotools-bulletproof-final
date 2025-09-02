import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GastroTools Professional - Restaurant Management Suite",
  description: "Professional nutrition calculator, cost control, inventory management, menu planning and card design tools for restaurants",
  keywords: "restaurant tools, nutrition calculator, cost control, inventory management, menu planning",
  authors: [{ name: "GastroTools Professional" }],
  openGraph: {
    title: "GastroTools Professional - Restaurant Management Suite",
    description: "Professional tools for modern restaurants and food businesses",
    type: "website",
    locale: "de_DE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}