import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jazz Landing - Loading",
  description: "Jazz Products Landing Page",
  icons: {
    icon: '/jazz-logo.webp',
    apple: '/jazz-logo.webp',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Mobile viewport configuration for consistent appearance */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        {/* iOS web app support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        {/* Theme color for Android */}
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="antialiased h-screen-dynamic">
        <main className="h-full">{children}</main>
      </body>
    </html>
  );
}
