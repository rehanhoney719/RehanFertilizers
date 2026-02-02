"use client";

import { useEffect, useState } from "react";

interface AlertProps {
  message: string;
  type: "success" | "danger" | "warning";
  onDismiss?: () => void;
}

export default function Alert({ message, type, onDismiss }: AlertProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible) return null;

  return <div className={`alert alert-${type}`}>{message}</div>;
}
