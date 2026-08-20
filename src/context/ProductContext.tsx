"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { type Product } from "@/data/products";

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  addProduct: (product: Omit<Product, "id"> & { id?: number }) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  decrementStock: (productId: number, quantity: number) => Promise<void>;
  updateStock: (productId: number, newStock: number) => Promise<void>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<void>;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  // Starts true so consumers can tell "not loaded yet" apart from "genuinely empty".
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial products from the API
  const refreshProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (e) {
      console.error("Failed to load products from database:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const addProduct = async (newProductData: Omit<Product, "id"> & { id?: number }) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProductData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.product) {
          setProducts((prev) => [data.product, ...prev]);
        }
      }
    } catch (e) {
      console.error("Failed to add product:", e);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete product:", e);
    }
  };

  const decrementStock = async (productId: number, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const newStock = Math.max(0, product.stock - quantity);
    await updateStock(productId, newStock);
  };

  const updateStock = async (productId: number, newStock: number) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
        );
      }
    } catch (e) {
      console.error("Failed to update stock:", e);
    }
  };

  const updateProduct = async (id: number, updatedData: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.product) {
          setProducts((prev) =>
            prev.map((p) => (p.id === id ? data.product : p))
          );
        }
      }
    } catch (e) {
      console.error("Failed to update product:", e);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        addProduct,
        deleteProduct,
        decrementStock,
        updateStock,
        updateProduct,
        refreshProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
