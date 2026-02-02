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
      <h2 style={{ marginBottom: 15, color: "#34495e" }}>Reports</h2>
      <p>Generate detailed sales and profit reports</p>

      <div style={{ marginTop: 20 }}>
        <button className="btn btn-primary" onClick={() => setReportType("daily")}>
          📅 Daily Report
        </button>
        <button className="btn btn-info" onClick={() => setReportType("monthly")}>
          📊 Monthly Report
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        {reportType === "daily" && (
          <div>
            <h3>Daily Report - {today}</h3>
            <div className="dashboard-grid" style={{ margin: "15px 0" }}>
              <StatCard title="Sales" value={formatCurrency(dailyTotal)} gradient="#27ae60" />
              <StatCard title="Profit" value={formatCurrency(dailyProfit)} gradient="#3498db" />
            </div>
          </div>
        )}

        {reportType === "monthly" && (
          <div>
            <h3>Monthly Report - {thisMonth}</h3>
            <div className="dashboard-grid" style={{ margin: "15px 0" }}>
              <StatCard title="Sales" value={formatCurrency(monthlyTotal)} gradient="#9b59b6" />
              <StatCard title="Profit" value={formatCurrency(monthlyProfit)} gradient="#e67e22" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
