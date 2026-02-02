"use client";

interface HeaderProps {
  notificationCount: number;
  onNotificationClick: () => void;
}

export default function Header({ notificationCount, onNotificationClick }: HeaderProps) {
  return (
    <div className="header">
      <h1>🌾 Ahsan Fertilizer & Crops Store</h1>
      <p>Complete Business Management System</p>
      {notificationCount > 0 && (
        <div className="notification-badge" onClick={onNotificationClick}>
          🔔 <span>{notificationCount}</span> Alerts
        </div>
      )}
    </div>
  );
}
