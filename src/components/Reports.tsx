"use client";

import { useState } from "react";
import { Sale } from "@/types";
import { formatCurrency, todayISO, thisMonthISO } from "@/lib/calculations";
import StatCard from "./ui/StatCard";

interface ReportsProps {
  sales: Sale[];
}

export default function Reports({ sales }: ReportsProps) {
  const [reportType, setReportType] = useState<"daily" | "monthly" | null>(null);

  const today = todayISO();
  const thisMonth = thisMonthISO();

  const todaySales = sales.filter((s) => s.date === today);
  const monthlySales = sales.filter((s) => s.date.startsWith(thisMonth));

  const dailyTotal = todaySales.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const dailyProfit = todaySales.reduce((sum, s) => sum + Number(s.profit || 0), 0);

  const monthlyTotal = monthlySales.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const monthlyProfit = monthlySales.reduce((sum, s) => sum + Number(s.profit || 0), 0);

  return (
    <div>
      <h2 className="page-title">Reports</h2>
      <p className="page-subtitle">Generate detailed sales and profit reports</p>

      <div className="action-buttons" style={{ marginBottom: 24 }}>
        <button className={`btn ${reportType === "daily" ? "btn-primary" : "btn-ghost"}`} onClick={() => setReportType("daily")}>
          Daily Report
        </button>
        <button className={`btn ${reportType === "monthly" ? "btn-primary" : "btn-ghost"}`} onClick={() => setReportType("monthly")}>
          Monthly Report
        </button>
      </div>

      {reportType === "daily" && (
        <div>
          <h3 className="section-title">Daily Report — {today}</h3>
          <div className="dashboard-grid">
            <StatCard title="Sales" value={formatCurrency(dailyTotal)} gradient="#059669" />
            <StatCard title="Profit" value={formatCurrency(dailyProfit)} gradient="#2563eb" />
            <StatCard title="Transactions" value={String(todaySales.length)} gradient="#d97706" />
          </div>
        </div>
      )}

      {reportType === "monthly" && (
        <div>
          <h3 className="section-title">Monthly Report — {thisMonth}</h3>
          <div className="dashboard-grid">
            <StatCard title="Sales" value={formatCurrency(monthlyTotal)} gradient="#7c3aed" />
            <StatCard title="Profit" value={formatCurrency(monthlyProfit)} gradient="#0891b2" />
            <StatCard title="Transactions" value={String(monthlySales.length)} gradient="#d97706" />
          </div>
        </div>
      )}
    </div>
  );
}
