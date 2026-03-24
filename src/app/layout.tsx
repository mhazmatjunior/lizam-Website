import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RAANAI | The Essence of Eternal Sophistication",
  description: "Experience the luxury of Raanai, showcasing 7th October—a premium fragrance designed for those who command presence and elegance.",
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
        className={`${inter.variable} ${playfair.variable} antialiased selection:bg-gold selection:text-black`}
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
