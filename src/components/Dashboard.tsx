"use client";

import { Sale, Purchase, Product } from "@/types";
import { calculateProductStock, formatCurrency, todayISO, thisMonthISO } from "@/lib/calculations";
import StatCard from "./ui/StatCard";

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
}

export default function Dashboard({ products, sales, purchases }: DashboardProps) {
  const today = todayISO();
  const thisMonth = thisMonthISO();

  const todaySales = sales.filter((s) => s.date === today);
  const monthlySales = sales.filter((s) => s.date.startsWith(thisMonth));

  const todaySalesTotal = todaySales.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const todayProfit = todaySales.reduce((sum, s) => sum + Number(s.profit || 0), 0);
  const monthlySalesTotal = monthlySales.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const monthlyProfit = monthlySales.reduce((sum, s) => sum + Number(s.profit || 0), 0);

  const pendingLoans = sales.filter((s) => Number(s.remaining_amount) > 0);
  const totalPending = pendingLoans.reduce((sum, s) => sum + Number(s.remaining_amount), 0);

  let totalStockValue = 0;
  products.forEach((product) => {
    const stock = calculateProductStock(product.id, purchases, sales);
    totalStockValue += stock.stockValue;
  });

  return (
    <div>
      <h2 className="page-title">Dashboard Overview</h2>
      <p className="page-subtitle">Real-time business metrics at a glance</p>
      <div className="dashboard-grid">
        <StatCard title="Today's Sales" value={formatCurrency(todaySalesTotal)} gradient="#059669" />
        <StatCard title="Today's Profit" value={formatCurrency(todayProfit)} gradient="#16a34a" />
        <StatCard title="Pending Loans" value={formatCurrency(totalPending)} gradient="#dc2626" />
        <StatCard title="Stock Value" value={formatCurrency(totalStockValue)} gradient="#2563eb" />
      </div>

      <h3 className="section-title">Monthly Performance</h3>
      <div className="dashboard-grid">
        <StatCard title="Monthly Sales" value={formatCurrency(monthlySalesTotal)} gradient="#7c3aed" />
        <StatCard title="Monthly Profit" value={formatCurrency(monthlyProfit)} gradient="#0891b2" />
        <StatCard title="Products" value={String(products.length)} gradient="#d97706" />
        <StatCard title="Transactions" value={String(sales.length + purchases.length)} gradient="#64748b" />
      </div>
    </div>
  );
}
