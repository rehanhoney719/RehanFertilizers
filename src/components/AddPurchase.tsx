"use client";

import { useState } from "react";
import { Product, Purchase } from "@/types";
import { todayISO } from "@/lib/calculations";
import Alert from "./ui/Alert";

interface AddPurchaseProps {
  products: Product[];
  onAddPurchase: (purchase: Omit<Purchase, "id" | "created_at">) => Promise<Purchase>;
  onSuccess: () => void;
}

export default function AddPurchase({ products, onAddPurchase, onSuccess }: AddPurchaseProps) {
  const [date, setDate] = useState(todayISO());
  const [productId, setProductId] = useState<number | "">("");
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [alert, setAlert] = useState<{ message: string; type: "success" | "danger" } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalAmount = (parseFloat(quantity) || 0) * (parseFloat(rate) || 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) return;

    try {
      setSubmitting(true);
      await onAddPurchase({
        product_id: Number(productId),
        quantity: parseFloat(quantity),
        rate: parseFloat(rate),
        total_amount: totalAmount,
        date,
        supplier,
        notes,
      });
      setAlert({ message: "✓ Purchase added successfully!", type: "success" });
      setTimeout(onSuccess, 1500);
    } catch {
      setAlert({ message: "Error adding purchase. Please try again.", type: "danger" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="page-title">Add Purchase</h2>
      {alert && <Alert message={alert.message} type={alert.type} onDismiss={() => setAlert(null)} />}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Product *</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value ? Number(e.target.value) : "")}
              required
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Quantity *</label>
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
            <label>Rate *</label>
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
            <label>Total Amount</label>
            <input type="number" value={totalAmount.toFixed(2)} readOnly />
          </div>
          <div className="form-group">
            <label>Supplier</label>
            <input type="text" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Adding..." : "📦 Add Purchase"}
        </button>
      </form>
    </div>
  );
}
