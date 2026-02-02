"use client";

import { TabName } from "@/types";

interface NavTabsProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const tabs: { name: TabName; label: string }[] = [
  { name: "dashboard", label: "📊 Dashboard" },
  { name: "add-sale", label: "💰 Add Sale" },
  { name: "add-purchase", label: "📦 Purchase" },
  { name: "crops", label: "🌾 Crops" },
  { name: "stock", label: "📋 Stock" },
  { name: "loans", label: "💳 Loans" },
  { name: "customers", label: "👥 Customers" },
  { name: "notifications", label: "🔔 Alerts" },
  { name: "reports", label: "📈 Reports" },
  { name: "products", label: "🏷️ Products" },
  { name: "backup", label: "💾 Backup" },
];

export default function NavTabs({ activeTab, onTabChange }: NavTabsProps) {
  return (
    <div className="nav-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          className={`nav-tab ${activeTab === tab.name ? "active" : ""}`}
          onClick={() => onTabChange(tab.name)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
