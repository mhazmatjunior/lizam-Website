import type { Metadata } from "next";
import { Montserrat, Playfair_Display, Alata } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/data/site";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const alata = Alata({
  variable: "--font-alata",
  subsets: ["latin"],
  weight: "400",
});


const SITE_DESCRIPTION =
  "Experience the luxury of Raanae, showcasing 7th October—a premium fragrance designed for those who command presence and elegance.";

export const metadata: Metadata = {
  // Resolves relative canonical and Open Graph URLs against the live domain.
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Raanae | The Fragrance of Freedom",
    template: "%s | Raanae",
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Raanae",
    locale: "en_PK",
    title: "Raanae | The Fragrance of Freedom",
    description: SITE_DESCRIPTION,
    images: [{ url: "/home/packshot.webp", width: 1200, height: 1500, alt: "7th October perfume and presentation box by Raanae" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Raanae | The Fragrance of Freedom",
    description: SITE_DESCRIPTION,
    images: ["/home/packshot.webp"],
  },
  icons: {
    icon: "/hero-bg-2.png",
    apple: "/hero-bg-2.png",
  }
};

import { CartProvider } from "@/context/CartContext";
import { ProductProvider } from "@/context/ProductContext";
import CartDrawer from "./components/CartDrawer";
import MetaPixel from "./components/MetaPixel";
import AttributionCapture from "./components/AttributionCapture";
import GoogleAnalytics from "./components/GoogleAnalytics";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Font variables live on <html> so the :root design font stacks in
  // globals.css can resolve them.
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${playfair.variable} ${alata.variable}`}
    >
      <body
        className="antialiased selection:bg-gold selection:text-black"
      >
        <MetaPixel />
        <GoogleAnalytics />
        <AttributionCapture />
        <ProductProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </ProductProvider>
      </body>
    </html>
  );
}
