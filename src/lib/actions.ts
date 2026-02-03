import { supabase } from "./supabase";
import { Product, Sale, Purchase, CropPurchase } from "@/types";

// ── Products ──────────────────────────────────────────────
export async function fetchProducts(userId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .order("id");
  if (error) throw error;
  return data ?? [];
}

export async function addProduct(userId: string, product: Omit<Product, "id" | "created_at" | "user_id">): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert({ ...product, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(userId: string, id: number): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function updateProduct(
  userId: string,
  id: number,
  updates: Partial<Omit<Product, "id" | "created_at" | "user_id">>
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Sales ─────────────────────────────────────────────────
export async function fetchSales(userId: string): Promise<Sale[]> {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("user_id", userId)
    .order("id", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addSale(userId: string, sale: Omit<Sale, "id" | "created_at" | "user_id">): Promise<Sale> {
  const { data, error } = await supabase
    .from("sales")
    .insert({ ...sale, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSale(
  userId: string,
  id: number,
  updates: Partial<Omit<Sale, "id" | "created_at" | "user_id">>
): Promise<Sale> {
  const { data, error } = await supabase
    .from("sales")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSale(userId: string, id: number): Promise<void> {
  const { error } = await supabase
    .from("sales")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

// ── Purchases ─────────────────────────────────────────────
export async function fetchPurchases(userId: string): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .order("id", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addPurchase(userId: string, purchase: Omit<Purchase, "id" | "created_at" | "user_id">): Promise<Purchase> {
  const { data, error } = await supabase
    .from("purchases")
    .insert({ ...purchase, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePurchase(
  userId: string,
  id: number,
  updates: Partial<Omit<Purchase, "id" | "created_at" | "user_id">>
): Promise<Purchase> {
  const { data, error } = await supabase
    .from("purchases")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePurchase(userId: string, id: number): Promise<void> {
  const { error } = await supabase
    .from("purchases")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

// ── Crop Purchases ────────────────────────────────────────
export async function fetchCropPurchases(userId: string): Promise<CropPurchase[]> {
  const { data, error } = await supabase
    .from("crop_purchases")
    .select("*")
    .eq("user_id", userId)
    .order("id", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addCropPurchase(
  userId: string,
  cropPurchase: Omit<CropPurchase, "id" | "created_at" | "user_id">
): Promise<CropPurchase> {
  const { data, error } = await supabase
    .from("crop_purchases")
    .insert({ ...cropPurchase, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCropPurchase(
  userId: string,
  id: number,
  updates: Partial<Omit<CropPurchase, "id" | "created_at" | "user_id">>
): Promise<CropPurchase> {
  const { data, error } = await supabase
    .from("crop_purchases")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCropPurchase(userId: string, id: number): Promise<void> {
  const { error } = await supabase
    .from("crop_purchases")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

// ── Bulk export (for backup) ──────────────────────────────
export async function fetchAllData(userId: string) {
  const [products, sales, purchases, cropPurchases] = await Promise.all([
    fetchProducts(userId),
    fetchSales(userId),
    fetchPurchases(userId),
    fetchCropPurchases(userId),
  ]);
  return { products, sales, purchases, cropPurchases };
}
