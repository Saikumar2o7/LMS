import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "LoanFlow - Smart Loan Management",
  description: "Apply, manage, and track loans seamlessly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
