import { supabase } from "./supabase";
import { Product, Sale, Purchase, CropPurchase, Shop } from "@/types";

// ── Shops ────────────────────────────────────────────────
export async function fetchShops(userId: string): Promise<Shop[]> {
  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("user_id", userId)
    .order("id");
  if (error) throw error;
  return data ?? [];
}

export async function addShop(userId: string, name: string): Promise<Shop> {
  const { data, error } = await supabase
    .from("shops")
    .insert({ name, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateShop(userId: string, id: number, name: string): Promise<Shop> {
  const { data, error } = await supabase
    .from("shops")
    .update({ name })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteShop(userId: string, id: number): Promise<void> {
  const { error } = await supabase
    .from("shops")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

// ── Products ──────────────────────────────────────────────
export async function fetchProducts(userId: string, shopId: number): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .eq("shop_id", shopId)
    .order("id");
  if (error) throw error;
  return data ?? [];
}

export async function addProduct(userId: string, shopId: number, product: Omit<Product, "id" | "created_at" | "user_id" | "shop_id">): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert({ ...product, user_id: userId, shop_id: shopId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(userId: string, shopId: number, id: number): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .eq("shop_id", shopId);
  if (error) throw error;
}

export async function updateProduct(
  userId: string,
  shopId: number,
  id: number,
  updates: Partial<Omit<Product, "id" | "created_at" | "user_id" | "shop_id">>
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .eq("shop_id", shopId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Sales ─────────────────────────────────────────────────
export async function fetchSales(userId: string, shopId: number): Promise<Sale[]> {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("user_id", userId)
    .eq("shop_id", shopId)
    .order("id", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addSale(userId: string, shopId: number, sale: Omit<Sale, "id" | "created_at" | "user_id" | "shop_id">): Promise<Sale> {
  const { data, error } = await supabase
    .from("sales")
    .insert({ ...sale, user_id: userId, shop_id: shopId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSale(
  userId: string,
  shopId: number,
  id: number,
  updates: Partial<Omit<Sale, "id" | "created_at" | "user_id" | "shop_id">>
): Promise<Sale> {
  const { data, error } = await supabase
    .from("sales")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .eq("shop_id", shopId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSale(userId: string, shopId: number, id: number): Promise<void> {
  const { error } = await supabase
    .from("sales")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .eq("shop_id", shopId);
  if (error) throw error;
}

// ── Purchases ─────────────────────────────────────────────
export async function fetchPurchases(userId: string, shopId: number): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("shop_id", shopId)
    .order("id", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addPurchase(userId: string, shopId: number, purchase: Omit<Purchase, "id" | "created_at" | "user_id" | "shop_id">): Promise<Purchase> {
  const { data, error } = await supabase
    .from("purchases")
    .insert({ ...purchase, user_id: userId, shop_id: shopId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePurchase(
  userId: string,
  shopId: number,
  id: number,
  updates: Partial<Omit<Purchase, "id" | "created_at" | "user_id" | "shop_id">>
): Promise<Purchase> {
  const { data, error } = await supabase
    .from("purchases")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .eq("shop_id", shopId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePurchase(userId: string, shopId: number, id: number): Promise<void> {
  const { error } = await supabase
    .from("purchases")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .eq("shop_id", shopId);
  if (error) throw error;
}

// ── Crop Purchases ────────────────────────────────────────
export async function fetchCropPurchases(userId: string, shopId: number): Promise<CropPurchase[]> {
  const { data, error } = await supabase
    .from("crop_purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("shop_id", shopId)
    .order("id", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addCropPurchase(
  userId: string,
  shopId: number,
  cropPurchase: Omit<CropPurchase, "id" | "created_at" | "user_id" | "shop_id">
): Promise<CropPurchase> {
  const { data, error } = await supabase
    .from("crop_purchases")
    .insert({ ...cropPurchase, user_id: userId, shop_id: shopId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCropPurchase(
  userId: string,
  shopId: number,
  id: number,
  updates: Partial<Omit<CropPurchase, "id" | "created_at" | "user_id" | "shop_id">>
): Promise<CropPurchase> {
  const { data, error } = await supabase
    .from("crop_purchases")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .eq("shop_id", shopId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCropPurchase(userId: string, shopId: number, id: number): Promise<void> {
  const { error } = await supabase
    .from("crop_purchases")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .eq("shop_id", shopId);
  if (error) throw error;
}

// ── Bulk export (for backup) ──────────────────────────────
export async function fetchAllData(userId: string, shopId: number) {
  const [products, sales, purchases, cropPurchases] = await Promise.all([
    fetchProducts(userId, shopId),
    fetchSales(userId, shopId),
    fetchPurchases(userId, shopId),
    fetchCropPurchases(userId, shopId),
  ]);
  return { products, sales, purchases, cropPurchases };
}
