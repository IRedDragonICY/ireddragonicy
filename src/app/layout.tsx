import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import BootGate from '@/components/BootGate';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "IRedDragonICY | Research Scientist Portfolio",
  description: "The professional portfolio of Mohammad Farid Hendianto, an aspiring Research Scientist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <BootGate>
          {children}
        </BootGate>
      </body>
    </html>
  );
}