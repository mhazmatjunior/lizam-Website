"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { PRODUCTS as INITIAL_PRODUCTS, type Product } from "@/data/products";

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  deleteProduct: (id: number) => void;
  decrementStock: (productId: number, quantity: number) => void;
  updateStock: (productId: number, newStock: number) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loadProducts = () => {
      const saved = localStorage.getItem("raanai_products");
      if (saved) {
        try {
          setProducts(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved products", e);
        }
      }
      setIsInitialized(true);
    };

    loadProducts();

    // Sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "raanai_products") {
        loadProducts();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Save to localStorage whenever products change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("raanai_products", JSON.stringify(products));
      } catch (e) {
        console.error("Storage quota exceeded", e);
        // Alert the user only if it's a quota error
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          alert("Your collection is very large! Some images might not be saved until you delete older scents.");
        }
      }
    }
  }, [products, isInitialized]);

  const addProduct = (newProductData: Omit<Product, "id">) => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct: Product = {
      ...newProductData,
      id: newId,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const decrementStock = (productId: number, quantity: number) => {
    setProducts((prev) => prev.map(p => {
      if (p.id === productId) {
        return { ...p, stock: Math.max(0, p.stock - quantity) };
      }
      return p;
    }));
  };

  const updateStock = (productId: number, newStock: number) => {
    setProducts((prev) => prev.map(p => {
      if (p.id === productId) {
        return { ...p, stock: newStock };
      }
      return p;
    }));
  };

  const updateProduct = (id: number, updatedData: Partial<Product>) => {
    setProducts((prev) => prev.map(p => {
      if (p.id === id) {
        return { ...p, ...updatedData };
      }
      return p;
    }));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, deleteProduct, decrementStock, updateStock, updateProduct }}>
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
