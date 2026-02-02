import { supabase } from "./supabase";
import { Product, Sale, Purchase, CropPurchase } from "@/types";

// ── Products ──────────────────────────────────────────────
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id");
  if (error) throw error;
  return data ?? [];
}

export async function addProduct(product: Omit<Product, "id" | "created_at">): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

// ── Sales ─────────────────────────────────────────────────
export async function fetchSales(): Promise<Sale[]> {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .order("id", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addSale(sale: Omit<Sale, "id" | "created_at">): Promise<Sale> {
  const { data, error } = await supabase
    .from("sales")
    .insert(sale)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Purchases ─────────────────────────────────────────────
export async function fetchPurchases(): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .order("id", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addPurchase(purchase: Omit<Purchase, "id" | "created_at">): Promise<Purchase> {
  const { data, error } = await supabase
    .from("purchases")
    .insert(purchase)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Crop Purchases ────────────────────────────────────────
export async function fetchCropPurchases(): Promise<CropPurchase[]> {
  const { data, error } = await supabase
    .from("crop_purchases")
    .select("*")
    .order("id", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addCropPurchase(
  cropPurchase: Omit<CropPurchase, "id" | "created_at">
): Promise<CropPurchase> {
  const { data, error } = await supabase
    .from("crop_purchases")
    .insert(cropPurchase)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Bulk export (for backup) ──────────────────────────────
export async function fetchAllData() {
  const [products, sales, purchases, cropPurchases] = await Promise.all([
    fetchProducts(),
    fetchSales(),
    fetchPurchases(),
    fetchCropPurchases(),
  ]);
  return { products, sales, purchases, cropPurchases };
}
