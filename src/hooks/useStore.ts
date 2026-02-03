"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Product, Sale, Purchase, CropPurchase, Shop } from "@/types";
import {
  fetchProducts,
  fetchSales,
  fetchPurchases,
  fetchCropPurchases,
  fetchShops,
  addShop as apiAddShop,
  updateShop as apiUpdateShop,
  deleteShop as apiDeleteShop,
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

  const [shops, setShops] = useState<Shop[]>([]);
  const [currentShopId, setCurrentShopId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [cropPurchases, setCropPurchases] = useState<CropPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentShop = shops.find((s) => s.id === currentShopId) ?? null;

  const loadShopData = useCallback(async (uid: string, shopId: number) => {
    try {
      setLoading(true);
      setError(null);
      const [p, s, pu, cp] = await Promise.all([
        fetchProducts(uid, shopId),
        fetchSales(uid, shopId),
        fetchPurchases(uid, shopId),
        fetchCropPurchases(uid, shopId),
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

  // Load shops on mount, then load data for selected shop
  useEffect(() => {
    if (!isLoaded || !userId) {
      if (isLoaded) setLoading(false);
      return;
    }

    let cancelled = false;

    async function init() {
      try {
        setLoading(true);
        setError(null);
        const loadedShops = await fetchShops(userId!);
        if (cancelled) return;
        setShops(loadedShops);

        if (loadedShops.length === 0) {
          setCurrentShopId(null);
          setProducts([]);
          setSales([]);
          setPurchases([]);
          setCropPurchases([]);
          setLoading(false);
          return;
        }

        // Restore from localStorage or use first shop
        const storageKey = `currentShopId_${userId}`;
        const stored = localStorage.getItem(storageKey);
        let selectedId = stored ? Number(stored) : null;

        // Validate that the stored shop still exists
        if (!selectedId || !loadedShops.some((s) => s.id === selectedId)) {
          selectedId = loadedShops[0].id;
        }

        setCurrentShopId(selectedId);
        await loadShopData(userId!, selectedId);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
          setLoading(false);
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [isLoaded, userId, loadShopData]);

  // Persist currentShopId to localStorage
  useEffect(() => {
    if (userId && currentShopId !== null) {
      localStorage.setItem(`currentShopId_${userId}`, String(currentShopId));
    }
  }, [userId, currentShopId]);

  const switchShop = useCallback(async (shopId: number) => {
    if (!userId || shopId === currentShopId) return;
    setCurrentShopId(shopId);
    await loadShopData(userId, shopId);
  }, [userId, currentShopId, loadShopData]);

  const createShop = async (name: string) => {
    if (!userId) throw new Error("Not authenticated");
    const newShop = await apiAddShop(userId, name);
    setShops((prev) => [...prev, newShop]);
    // Switch to the new shop
    setCurrentShopId(newShop.id);
    await loadShopData(userId, newShop.id);
    return newShop;
  };

  const renameShop = async (id: number, name: string) => {
    if (!userId) throw new Error("Not authenticated");
    const updated = await apiUpdateShop(userId, id, name);
    setShops((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  const removeShop = async (id: number) => {
    if (!userId) throw new Error("Not authenticated");
    await apiDeleteShop(userId, id);
    const remaining = shops.filter((s) => s.id !== id);
    setShops(remaining);

    // If the deleted shop was current, switch to another
    if (currentShopId === id) {
      if (remaining.length > 0) {
        setCurrentShopId(remaining[0].id);
        await loadShopData(userId, remaining[0].id);
      } else {
        setCurrentShopId(null);
        setProducts([]);
        setSales([]);
        setPurchases([]);
        setCropPurchases([]);
      }
    }
  };

  const reload = useCallback(async () => {
    if (!userId || currentShopId === null) return;
    await loadShopData(userId, currentShopId);
  }, [userId, currentShopId, loadShopData]);

  const addProduct = async (product: Omit<Product, "id" | "created_at" | "user_id" | "shop_id">) => {
    if (!userId || currentShopId === null) throw new Error("Not authenticated");
    const newProduct = await apiAddProduct(userId, currentShopId, product);
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  };

  const removeProduct = async (id: number) => {
    if (!userId || currentShopId === null) throw new Error("Not authenticated");
    await apiDeleteProduct(userId, currentShopId, id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addSale = async (sale: Omit<Sale, "id" | "created_at" | "user_id" | "shop_id">) => {
    if (!userId || currentShopId === null) throw new Error("Not authenticated");
    const newSale = await apiAddSale(userId, currentShopId, sale);
    setSales((prev) => [newSale, ...prev]);
    return newSale;
  };

  const addPurchase = async (purchase: Omit<Purchase, "id" | "created_at" | "user_id" | "shop_id">) => {
    if (!userId || currentShopId === null) throw new Error("Not authenticated");
    const newPurchase = await apiAddPurchase(userId, currentShopId, purchase);
    setPurchases((prev) => [newPurchase, ...prev]);
    return newPurchase;
  };

  const addCropPurchase = async (cp: Omit<CropPurchase, "id" | "created_at" | "user_id" | "shop_id">) => {
    if (!userId || currentShopId === null) throw new Error("Not authenticated");
    const newCp = await apiAddCropPurchase(userId, currentShopId, cp);
    setCropPurchases((prev) => [newCp, ...prev]);
    return newCp;
  };

  const editProduct = async (id: number, updates: Partial<Omit<Product, "id" | "created_at" | "user_id" | "shop_id">>) => {
    if (!userId || currentShopId === null) throw new Error("Not authenticated");
    const updated = await apiUpdateProduct(userId, currentShopId, id, updates);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const editSale = async (id: number, updates: Partial<Omit<Sale, "id" | "created_at" | "user_id" | "shop_id">>) => {
    if (!userId || currentShopId === null) throw new Error("Not authenticated");
    const updated = await apiUpdateSale(userId, currentShopId, id, updates);
    setSales((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  const removeSale = async (id: number) => {
    if (!userId || currentShopId === null) throw new Error("Not authenticated");
    await apiDeleteSale(userId, currentShopId, id);
    setSales((prev) => prev.filter((s) => s.id !== id));
  };

  const editPurchase = async (id: number, updates: Partial<Omit<Purchase, "id" | "created_at" | "user_id" | "shop_id">>) => {
    if (!userId || currentShopId === null) throw new Error("Not authenticated");
    const updated = await apiUpdatePurchase(userId, currentShopId, id, updates);
    setPurchases((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const removePurchase = async (id: number) => {
    if (!userId || currentShopId === null) throw new Error("Not authenticated");
    await apiDeletePurchase(userId, currentShopId, id);
    setPurchases((prev) => prev.filter((p) => p.id !== id));
  };

  const editCropPurchase = async (id: number, updates: Partial<Omit<CropPurchase, "id" | "created_at" | "user_id" | "shop_id">>) => {
    if (!userId || currentShopId === null) throw new Error("Not authenticated");
    const updated = await apiUpdateCropPurchase(userId, currentShopId, id, updates);
    setCropPurchases((prev) => prev.map((cp) => (cp.id === id ? updated : cp)));
    return updated;
  };

  const removeCropPurchase = async (id: number) => {
    if (!userId || currentShopId === null) throw new Error("Not authenticated");
    await apiDeleteCropPurchase(userId, currentShopId, id);
    setCropPurchases((prev) => prev.filter((cp) => cp.id !== id));
  };

  return {
    // Shop state
    shops,
    currentShopId,
    currentShop,
    switchShop,
    createShop,
    renameShop,
    removeShop,
    // Data state
    products,
    sales,
    purchases,
    cropPurchases,
    loading,
    error,
    reload,
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
