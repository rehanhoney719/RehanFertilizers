"use client";

import { useState, useEffect, useCallback } from "react";
import { Product, Sale, Purchase, CropPurchase } from "@/types";
import {
  fetchProducts,
  fetchSales,
  fetchPurchases,
  fetchCropPurchases,
  addProduct as apiAddProduct,
  addSale as apiAddSale,
  addPurchase as apiAddPurchase,
  addCropPurchase as apiAddCropPurchase,
  deleteProduct as apiDeleteProduct,
} from "@/lib/actions";

export function useStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [cropPurchases, setCropPurchases] = useState<CropPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [p, s, pu, cp] = await Promise.all([
        fetchProducts(),
        fetchSales(),
        fetchPurchases(),
        fetchCropPurchases(),
      ]);
      setProducts(p);
      setSales(s);
      setPurchases(pu);
      setCropPurchases(cp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const addProduct = async (product: Omit<Product, "id" | "created_at">) => {
    const newProduct = await apiAddProduct(product);
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  };

  const removeProduct = async (id: number) => {
    await apiDeleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addSale = async (sale: Omit<Sale, "id" | "created_at">) => {
    const newSale = await apiAddSale(sale);
    setSales((prev) => [newSale, ...prev]);
    return newSale;
  };

  const addPurchase = async (purchase: Omit<Purchase, "id" | "created_at">) => {
    const newPurchase = await apiAddPurchase(purchase);
    setPurchases((prev) => [newPurchase, ...prev]);
    return newPurchase;
  };

  const addCropPurchase = async (cp: Omit<CropPurchase, "id" | "created_at">) => {
    const newCp = await apiAddCropPurchase(cp);
    setCropPurchases((prev) => [newCp, ...prev]);
    return newCp;
  };

  return {
    products,
    sales,
    purchases,
    cropPurchases,
    loading,
    error,
    reload: loadAll,
    addProduct,
    removeProduct,
    addSale,
    addPurchase,
    addCropPurchase,
  };
}
