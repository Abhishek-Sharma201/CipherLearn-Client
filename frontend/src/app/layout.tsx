import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/redux/provider";
import { AuthRehydrate } from "@/components/AuthRehydrate";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "CipherLearn - Smart Tuition Management",
  description: "Comprehensive management solution for tuition centers and educators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <ReduxProvider>
          <AuthRehydrate />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
