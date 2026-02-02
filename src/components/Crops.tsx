"use client";

import { useState } from "react";
import { CropPurchase } from "@/types";
import { getCropInventory, formatCurrency, todayISO } from "@/lib/calculations";
import Alert from "./ui/Alert";

interface CropsProps {
  cropPurchases: CropPurchase[];
  onAddCropPurchase: (cp: Omit<CropPurchase, "id" | "created_at">) => Promise<CropPurchase>;
}

export default function Crops({ cropPurchases, onAddCropPurchase }: CropsProps) {
  const [cropType, setCropType] = useState("");
  const [date, setDate] = useState(todayISO());
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [alert, setAlert] = useState<{ message: string; type: "success" | "danger" } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalAmount = (parseFloat(quantity) || 0) * (parseFloat(rate) || 0);
  const inventory = getCropInventory(cropPurchases);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onAddCropPurchase({
        crop_type: cropType,
        quantity: parseFloat(quantity),
        rate: parseFloat(rate),
        total_amount: totalAmount,
        date,
        supplier,
        notes,
        status: "in_storage",
      });
      setAlert({ message: "✓ Crop purchase added!", type: "success" });
      setCropType("");
      setQuantity("");
      setRate("");
      setSupplier("");
      setNotes("");
    } catch {
      setAlert({ message: "Error adding crop purchase.", type: "danger" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 15, color: "#34495e" }}>Crops Management</h2>
      <p style={{ marginBottom: 15, color: "#7f8c8d" }}>
        Track crops bought from suppliers and sold to factories
      </p>

      {alert && <Alert message={alert.message} type={alert.type} onDismiss={() => setAlert(null)} />}

      <h3 style={{ marginBottom: 10, color: "#34495e" }}>Add Crop Purchase</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Crop Type *</label>
            <input
              type="text"
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              required
              placeholder="e.g., Wheat, Rice"
            />
          </div>
          <div className="form-group">
            <label>Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Quantity (kg) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Rate/kg *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Total</label>
            <input type="number" value={totalAmount.toFixed(2)} readOnly />
          </div>
          <div className="form-group">
            <label>Supplier</label>
            <input type="text" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Storage location, quality, etc..."
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Adding..." : "🌾 Add Crop Purchase"}
        </button>
      </form>

      <h3 style={{ margin: "25px 0 15px", color: "#34495e" }}>Crop Inventory</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Crop</th>
              <th>Quantity (kg)</th>
              <th>Avg Rate</th>
              <th>Investment</th>
              <th>Storage Days</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  No crops in storage
                </td>
              </tr>
            ) : (
              inventory.map((inv) => (
                <tr key={inv.cropType}>
                  <td>
                    <strong>{inv.cropType}</strong>
                  </td>
                  <td>{inv.totalQuantity.toFixed(2)} kg</td>
                  <td>Rs. {inv.avgRate.toFixed(2)}/kg</td>
                  <td>{formatCurrency(inv.totalCost)}</td>
                  <td>{inv.daysInStorage} days</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
