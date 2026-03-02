import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tokenized RWA Visualizer",
  description:
    "3D visualization of the top 20 institutional tokenized real-world asset funds on public blockchains",
  keywords: ["RWA", "tokenization", "DeFi", "BlackRock", "BUIDL", "real-world assets", "blockchain"],
  openGraph: {
    title: "Tokenized RWA Visualizer",
    description: "Explore tokenized real-world asset funds in 3D",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
