import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

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
        
        {/* Google Tag Manager preconnect */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* Global Google Tag (gtag.js) - GA4 & Google Ads */}
        <link
          rel="preload"
          as="script"
          href="https://www.googletagmanager.com/gtag/js?id=G-7H51N4FGGD"
          crossOrigin="anonymous"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7H51N4FGGD"
          strategy="afterInteractive"
        />
        <Script id="google-analytics-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-10779246142');
            // GA4 Configuration
            gtag('config', 'G-7H51N4FGGD');
          `}
        </Script>
      </head>
      <body className="antialiased h-screen-dynamic">
        <main className="h-full">{children}</main>
      </body>
    </html>
  );
}
