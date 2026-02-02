"use client";

import { Notification } from "@/types";

interface NotificationsProps {
  notifications: Notification[];
}

export default function Notifications({ notifications }: NotificationsProps) {
  return (
    <div>
      <h2 style={{ marginBottom: 15, color: "#34495e" }}>Notifications & Alerts</h2>

      {notifications.length === 0 ? (
        <div className="alert alert-success">
          <strong>✅ All good!</strong> No alerts at this time.
        </div>
      ) : (
        notifications.map((notif, index) => (
          <div key={index} className={`alert alert-${notif.type}`}>
            <strong>
              {notif.icon} {notif.title}
            </strong>
            <br />
            {notif.message}
          </div>
        ))
      )}
    </div>
  );
}
