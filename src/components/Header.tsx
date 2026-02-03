"use client";

import { UserButton } from "@clerk/nextjs";

interface HeaderProps {
  notificationCount: number;
  onNotificationClick: () => void;
}

export default function Header({ notificationCount, onNotificationClick }: HeaderProps) {
  return (
    <div className="header">
      <div className="header-content">
        <div>
          <h1>Ahsan Fertilizer & Crops Store</h1>
          <p>Complete Business Management System</p>
        </div>
        <div className="header-actions">
          {notificationCount > 0 && (
            <div className="notification-badge" onClick={onNotificationClick}>
              <span>{notificationCount}</span> Alerts
            </div>
          )}
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </div>
  );
}
