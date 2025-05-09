import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const monaSans = Mona_Sans({
  variable: "--font-monad-sans",
  subsets: ["latin"], 
});


export const metadata: Metadata = {
  title: "AceVox",
  description: "AI powered interview assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${monaSans.className} antialiased relative bg-gradient-to-b from-[#000205] via-[#001326] to-[#000a14] glow`}
      >
        <div className="absolute inset-0 pattern pointer-events-none"></div>
        {children}
        <Toaster/>
      </body>
    </html>
  );
}
