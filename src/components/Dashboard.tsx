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
      <h2 style={{ marginBottom: 15, color: "#34495e" }}>Dashboard Overview</h2>
      <div className="dashboard-grid">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(todaySalesTotal)}
          gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
        />
        <StatCard
          title="Today's Profit"
          value={formatCurrency(todayProfit)}
          gradient="linear-gradient(135deg, #eb3349 0%, #f45c43 100%)"
        />
        <StatCard
          title="Pending Loans"
          value={formatCurrency(totalPending)}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <StatCard
          title="Stock Value"
          value={formatCurrency(totalStockValue)}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
      </div>

      <h3 style={{ margin: "20px 0 15px", color: "#34495e" }}>Monthly Performance</h3>
      <div className="dashboard-grid">
        <StatCard
          title="Monthly Sales"
          value={formatCurrency(monthlySalesTotal)}
          gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
        />
        <StatCard
          title="Monthly Profit"
          value={formatCurrency(monthlyProfit)}
          gradient="linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
        />
        <StatCard
          title="Products"
          value={String(products.length)}
          gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
          darkText
        />
        <StatCard
          title="Transactions"
          value={String(sales.length + purchases.length)}
          gradient="linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)"
          darkText
        />
      </div>
    </div>
  );
}
