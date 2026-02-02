export interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
  min_stock: number;
  created_at?: string;
}

export interface Sale {
  id: number;
  product_id: number;
  quantity: number;
  rate: number;
  total_amount: number;
  profit: number;
  date: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  payment_status: "cash" | "loan" | "partial";
  amount_paid: number;
  remaining_amount: number;
  due_date: string | null;
  notes: string;
  created_at?: string;
}

export interface Purchase {
  id: number;
  product_id: number;
  quantity: number;
  rate: number;
  total_amount: number;
  date: string;
  supplier: string;
  notes: string;
  created_at?: string;
}

export interface CropPurchase {
  id: number;
  crop_type: string;
  quantity: number;
  rate: number;
  total_amount: number;
  date: string;
  supplier: string;
  notes: string;
  status: "in_storage" | "sold";
  created_at?: string;
}

export interface ProductStock {
  totalBought: number;
  totalSold: number;
  stockLeft: number;
  avgPurchaseRate: number;
  stockValue: number;
  totalProfit: number;
}

export interface CropInventoryItem {
  cropType: string;
  totalQuantity: number;
  totalCost: number;
  oldestDate: string;
  avgRate: number;
  daysInStorage: number;
}

export interface CustomerSummary {
  name: string;
  phone: string;
  address: string;
  totalPurchases: number;
  outstandingLoans: number;
  lastPurchase: string;
}

export interface Notification {
  type: "warning" | "danger";
  icon: string;
  title: string;
  message: string;
}

export type TabName =
  | "dashboard"
  | "add-sale"
  | "add-purchase"
  | "crops"
  | "stock"
  | "loans"
  | "customers"
  | "notifications"
  | "reports"
  | "products"
  | "backup";
