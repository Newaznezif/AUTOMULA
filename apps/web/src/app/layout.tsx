import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AUTOMULA — FormPilot AI",
  description:
    "Understand forms, prepare evidence-grounded answers, and fill supported websites with user approval.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
