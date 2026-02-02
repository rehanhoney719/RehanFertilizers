"use client";

import { useState, useMemo } from "react";
import { TabName } from "@/types";
import { useStore } from "@/hooks/useStore";
import { getNotifications } from "@/lib/calculations";
import Header from "@/components/Header";
import NavTabs from "@/components/NavTabs";
import Dashboard from "@/components/Dashboard";
import AddSale from "@/components/AddSale";
import AddPurchase from "@/components/AddPurchase";
import Crops from "@/components/Crops";
import Stock from "@/components/Stock";
import Loans from "@/components/Loans";
import Customers from "@/components/Customers";
import Notifications from "@/components/Notifications";
import Reports from "@/components/Reports";
import Products from "@/components/Products";
import Backup from "@/components/Backup";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabName>("dashboard");
  const store = useStore();

  const notifications = useMemo(
    () => getNotifications(store.products, store.sales, store.purchases),
    [store.products, store.sales, store.purchases]
  );

  function renderTab() {
    if (store.loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading data from Supabase...</p>
        </div>
      );
    }

    if (store.error) {
      return (
        <div className="error-container">
          <div className="alert alert-danger">
            <strong>Error:</strong> {store.error}
          </div>
          <button className="btn btn-primary" onClick={store.reload}>
            Retry
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            products={store.products}
            sales={store.sales}
            purchases={store.purchases}
          />
        );
      case "add-sale":
        return (
          <AddSale
            products={store.products}
            sales={store.sales}
            purchases={store.purchases}
            onAddSale={store.addSale}
            onSuccess={() => setActiveTab("dashboard")}
          />
        );
      case "add-purchase":
        return (
          <AddPurchase
            products={store.products}
            onAddPurchase={store.addPurchase}
            onSuccess={() => setActiveTab("dashboard")}
          />
        );
      case "crops":
        return (
          <Crops
            cropPurchases={store.cropPurchases}
            onAddCropPurchase={store.addCropPurchase}
          />
        );
      case "stock":
        return (
          <Stock
            products={store.products}
            sales={store.sales}
            purchases={store.purchases}
          />
        );
      case "loans":
        return <Loans sales={store.sales} products={store.products} />;
      case "customers":
        return <Customers sales={store.sales} />;
      case "notifications":
        return <Notifications notifications={notifications} />;
      case "reports":
        return <Reports sales={store.sales} />;
      case "products":
        return (
          <Products
            products={store.products}
            sales={store.sales}
            purchases={store.purchases}
            onAddProduct={store.addProduct}
            onDeleteProduct={store.removeProduct}
          />
        );
      case "backup":
        return (
          <Backup
            products={store.products}
            sales={store.sales}
            purchases={store.purchases}
            cropPurchases={store.cropPurchases}
            onReload={store.reload}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="container">
      <Header
        notificationCount={notifications.length}
        onNotificationClick={() => setActiveTab("notifications")}
      />
      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="content">{renderTab()}</div>
    </div>
  );
}
