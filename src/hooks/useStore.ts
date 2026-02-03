"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
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
  updateProduct as apiUpdateProduct,
  updateSale as apiUpdateSale,
  deleteSale as apiDeleteSale,
  updatePurchase as apiUpdatePurchase,
  deletePurchase as apiDeletePurchase,
  updateCropPurchase as apiUpdateCropPurchase,
  deleteCropPurchase as apiDeleteCropPurchase,
} from "@/lib/actions";

export function useStore() {
  const { user, isLoaded } = useUser();
  const userId = user?.id;

  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [cropPurchases, setCropPurchases] = useState<CropPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const [p, s, pu, cp] = await Promise.all([
        fetchProducts(userId),
        fetchSales(userId),
        fetchPurchases(userId),
        fetchCropPurchases(userId),
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
  }, [userId]);

  useEffect(() => {
    if (isLoaded && userId) {
      loadAll();
    } else if (isLoaded && !userId) {
      setLoading(false);
    }
  }, [isLoaded, userId, loadAll]);

  const addProduct = async (product: Omit<Product, "id" | "created_at" | "user_id">) => {
    if (!userId) throw new Error("Not authenticated");
    const newProduct = await apiAddProduct(userId, product);
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  };

  const removeProduct = async (id: number) => {
    if (!userId) throw new Error("Not authenticated");
    await apiDeleteProduct(userId, id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addSale = async (sale: Omit<Sale, "id" | "created_at" | "user_id">) => {
    if (!userId) throw new Error("Not authenticated");
    const newSale = await apiAddSale(userId, sale);
    setSales((prev) => [newSale, ...prev]);
    return newSale;
  };

  const addPurchase = async (purchase: Omit<Purchase, "id" | "created_at" | "user_id">) => {
    if (!userId) throw new Error("Not authenticated");
    const newPurchase = await apiAddPurchase(userId, purchase);
    setPurchases((prev) => [newPurchase, ...prev]);
    return newPurchase;
  };

  const addCropPurchase = async (cp: Omit<CropPurchase, "id" | "created_at" | "user_id">) => {
    if (!userId) throw new Error("Not authenticated");
    const newCp = await apiAddCropPurchase(userId, cp);
    setCropPurchases((prev) => [newCp, ...prev]);
    return newCp;
  };

  const editProduct = async (id: number, updates: Partial<Omit<Product, "id" | "created_at" | "user_id">>) => {
    if (!userId) throw new Error("Not authenticated");
    const updated = await apiUpdateProduct(userId, id, updates);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const editSale = async (id: number, updates: Partial<Omit<Sale, "id" | "created_at" | "user_id">>) => {
    if (!userId) throw new Error("Not authenticated");
    const updated = await apiUpdateSale(userId, id, updates);
    setSales((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  const removeSale = async (id: number) => {
    if (!userId) throw new Error("Not authenticated");
    await apiDeleteSale(userId, id);
    setSales((prev) => prev.filter((s) => s.id !== id));
  };

  const editPurchase = async (id: number, updates: Partial<Omit<Purchase, "id" | "created_at" | "user_id">>) => {
    if (!userId) throw new Error("Not authenticated");
    const updated = await apiUpdatePurchase(userId, id, updates);
    setPurchases((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const removePurchase = async (id: number) => {
    if (!userId) throw new Error("Not authenticated");
    await apiDeletePurchase(userId, id);
    setPurchases((prev) => prev.filter((p) => p.id !== id));
  };

  const editCropPurchase = async (id: number, updates: Partial<Omit<CropPurchase, "id" | "created_at" | "user_id">>) => {
    if (!userId) throw new Error("Not authenticated");
    const updated = await apiUpdateCropPurchase(userId, id, updates);
    setCropPurchases((prev) => prev.map((cp) => (cp.id === id ? updated : cp)));
    return updated;
  };

  const removeCropPurchase = async (id: number) => {
    if (!userId) throw new Error("Not authenticated");
    await apiDeleteCropPurchase(userId, id);
    setCropPurchases((prev) => prev.filter((cp) => cp.id !== id));
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
    editProduct,
    addSale,
    editSale,
    removeSale,
    addPurchase,
    editPurchase,
    removePurchase,
    addCropPurchase,
    editCropPurchase,
    removeCropPurchase,
  };
}
