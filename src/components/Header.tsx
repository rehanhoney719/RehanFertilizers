"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Shop } from "@/types";
import ShopManagementModal from "./ShopManagementModal";

interface HeaderProps {
  notificationCount: number;
  onNotificationClick: () => void;
  shops: Shop[];
  currentShopId: number | null;
  onSwitchShop: (shopId: number) => void;
  onCreateShop: (name: string) => Promise<unknown>;
  onRenameShop: (id: number, name: string) => Promise<unknown>;
  onDeleteShop: (id: number) => Promise<unknown>;
}

export default function Header({
  notificationCount,
  onNotificationClick,
  shops,
  currentShopId,
  onSwitchShop,
  onCreateShop,
  onRenameShop,
  onDeleteShop,
}: HeaderProps) {
  const [showManage, setShowManage] = useState(false);

  return (
    <div className="header">
      <div className="header-content">
        <div>
          <h1>Ahsan Fertilizer & Crops Store</h1>
          <p>Complete Business Management System</p>
        </div>
        <div className="header-actions">
          {shops.length > 0 && (
            <div className="shop-selector-group">
              <select
                className="shop-selector"
                value={currentShopId ?? ""}
                onChange={(e) => onSwitchShop(Number(e.target.value))}
              >
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
              <button
                className="shop-manage-btn"
                onClick={() => setShowManage(true)}
                title="Manage shops"
              >
                &#9881;
              </button>
            </div>
          )}
          {notificationCount > 0 && (
            <div className="notification-badge" onClick={onNotificationClick}>
              <span>{notificationCount}</span> Alerts
            </div>
          )}
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
      {showManage && (
        <ShopManagementModal
          shops={shops}
          currentShopId={currentShopId}
          onClose={() => setShowManage(false)}
          onCreateShop={onCreateShop}
          onRenameShop={onRenameShop}
          onDeleteShop={onDeleteShop}
        />
      )}
    </div>
  );
}
