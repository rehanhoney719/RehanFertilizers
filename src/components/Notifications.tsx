"use client";

import { Notification } from "@/types";

interface NotificationsProps {
  notifications: Notification[];
}

export default function Notifications({ notifications }: NotificationsProps) {
  return (
    <div>
      <h2 className="page-title">Notifications & Alerts</h2>
      <p className="page-subtitle">Low stock warnings and overdue loan reminders</p>

      {notifications.length === 0 ? (
        <div className="alert alert-success">
          <strong>All good!</strong> No alerts at this time.
        </div>
      ) : (
        notifications.map((notif, index) => (
          <div key={index} className={`alert alert-${notif.type}`}>
            <strong>{notif.icon} {notif.title}</strong>
            <br />
            {notif.message}
          </div>
        ))
      )}
    </div>
  );
}
