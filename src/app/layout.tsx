import type { Metadata } from "next";
import { Inter, Playfair_Display, Alata } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
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

export const metadata: Metadata = {
  title: "Raanae | The Fragrance of Freedom",
  description: "Experience the luxury of Raanae, showcasing 7th October—a premium fragrance designed for those who command presence and elegance.",
  icons: {
    icon: "/hero-bg-2.png",
    apple: "/hero-bg-2.png",
  }
};

import { CartProvider } from "@/context/CartContext";
import { ProductProvider } from "@/context/ProductContext";
import CartDrawer from "./components/CartDrawer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${alata.variable} antialiased selection:bg-gold selection:text-black`}
      >
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
