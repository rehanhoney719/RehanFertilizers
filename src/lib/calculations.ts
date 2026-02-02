import { Sale, Purchase, Product, ProductStock, CropPurchase, CropInventoryItem, CustomerSummary, Notification } from "@/types";

export function calculateProductStock(
  productId: number,
  purchases: Purchase[],
  sales: Sale[]
): ProductStock {
  const productPurchases = purchases.filter((p) => p.product_id === productId);
  const productSales = sales.filter((s) => s.product_id === productId);

  const totalBought = productPurchases.reduce((sum, p) => sum + Number(p.quantity), 0);
  const totalSold = productSales.reduce((sum, s) => sum + Number(s.quantity), 0);
  const stockLeft = totalBought - totalSold;

  const totalPurchaseAmount = productPurchases.reduce((sum, p) => sum + Number(p.total_amount), 0);
  const avgPurchaseRate = totalBought > 0 ? totalPurchaseAmount / totalBought : 0;

  const stockValue = stockLeft * avgPurchaseRate;

  let totalProfit = 0;
  productSales.forEach((sale) => {
    totalProfit += Number(sale.quantity) * (Number(sale.rate) - avgPurchaseRate);
  });

  return {
    totalBought,
    totalSold,
    stockLeft,
    avgPurchaseRate,
    stockValue,
    totalProfit,
  };
}

export function getCropInventory(cropPurchases: CropPurchase[]): CropInventoryItem[] {
  const inventory: Record<string, { totalQuantity: number; totalCost: number; oldestDate: string }> = {};

  cropPurchases
    .filter((cp) => cp.status === "in_storage")
    .forEach((purchase) => {
      if (!inventory[purchase.crop_type]) {
        inventory[purchase.crop_type] = {
          totalQuantity: 0,
          totalCost: 0,
          oldestDate: purchase.date,
        };
      }
      inventory[purchase.crop_type].totalQuantity += Number(purchase.quantity);
      inventory[purchase.crop_type].totalCost += Number(purchase.total_amount);
      if (purchase.date < inventory[purchase.crop_type].oldestDate) {
        inventory[purchase.crop_type].oldestDate = purchase.date;
      }
    });

  return Object.entries(inventory).map(([cropType, inv]) => ({
    cropType,
    totalQuantity: inv.totalQuantity,
    totalCost: inv.totalCost,
    oldestDate: inv.oldestDate,
    avgRate: inv.totalQuantity > 0 ? inv.totalCost / inv.totalQuantity : 0,
    daysInStorage: Math.floor(
      (new Date().getTime() - new Date(inv.oldestDate).getTime()) / (1000 * 60 * 60 * 24)
    ),
  }));
}

export function getCustomerSummaries(sales: Sale[]): CustomerSummary[] {
  const customers: Record<string, CustomerSummary> = {};

  sales.forEach((sale) => {
    if (sale.customer_name) {
      if (!customers[sale.customer_name]) {
        customers[sale.customer_name] = {
          name: sale.customer_name,
          phone: sale.customer_phone || "-",
          address: sale.customer_address || "-",
          totalPurchases: 0,
          outstandingLoans: 0,
          lastPurchase: sale.date,
        };
      }
      customers[sale.customer_name].totalPurchases += Number(sale.total_amount);
      customers[sale.customer_name].outstandingLoans += Number(sale.remaining_amount) || 0;
      if (sale.date > customers[sale.customer_name].lastPurchase) {
        customers[sale.customer_name].lastPurchase = sale.date;
      }
    }
  });

  return Object.values(customers);
}

export function getNotifications(products: Product[], sales: Sale[], purchases: Purchase[]): Notification[] {
  const notifications: Notification[] = [];

  products.forEach((product) => {
    const stock = calculateProductStock(product.id, purchases, sales);
    if (stock.stockLeft < Number(product.min_stock)) {
      notifications.push({
        type: "warning",
        icon: "⚠️",
        title: "Low Stock Alert",
        message: `${product.name} is running low (${stock.stockLeft.toFixed(2)} ${product.unit})`,
      });
    }
  });

  const today = new Date();
  sales.forEach((sale) => {
    if (
      Number(sale.remaining_amount) > 0 &&
      sale.due_date &&
      new Date(sale.due_date) < today
    ) {
      const daysOverdue = Math.floor(
        (today.getTime() - new Date(sale.due_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      notifications.push({
        type: "danger",
        icon: "🔴",
        title: "Overdue Loan",
        message: `${sale.customer_name || "Customer"} - Rs. ${Number(sale.remaining_amount).toLocaleString("en-PK")} overdue by ${daysOverdue} days`,
      });
    }
  });

  return notifications;
}

export function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function thisMonthISO(): string {
  return new Date().toISOString().slice(0, 7);
}
