import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tip Jar — Support creators on-chain",
  description:
    "Send a coffee to your favourite creator. Every tip is recorded on Ethereum — transparent, permanent, no middleman.",
  openGraph: {
    title: "Tip Jar",
    description: "On-chain tips for creators. No platform. No cut.",
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
