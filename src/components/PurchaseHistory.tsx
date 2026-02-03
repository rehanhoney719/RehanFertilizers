"use client";

import { useState } from "react";
import { Product, Purchase, Sale } from "@/types";
import { formatCurrency, calculateProductStock } from "@/lib/calculations";
import EditModal, { EditField } from "./ui/EditModal";
import ConfirmDialog from "./ui/ConfirmDialog";

interface PurchaseHistoryProps {
  products: Product[];
  purchases: Purchase[];
  sales: Sale[];
  onEditPurchase: (id: number, updates: Partial<Omit<Purchase, "id" | "created_at">>) => Promise<Purchase>;
  onDeletePurchase: (id: number) => Promise<void>;
}

export default function PurchaseHistory({
  products,
  purchases,
  sales,
  onEditPurchase,
  onDeletePurchase,
}: PurchaseHistoryProps) {
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [deletingPurchase, setDeletingPurchase] = useState<Purchase | null>(null);
  const [error, setError] = useState<string | null>(null);

  const editFields: EditField[] = [
    {
      key: "product_id",
      label: "Product",
      type: "select",
      required: true,
      options: products.map((p) => ({ value: String(p.id), label: p.name })),
    },
    { key: "date", label: "Date", type: "date", required: true },
    { key: "quantity", label: "Quantity", type: "number", required: true, step: "0.01", min: "0.01" },
    { key: "rate", label: "Rate", type: "number", required: true, step: "0.01", min: "0" },
    { key: "supplier", label: "Supplier", type: "text" },
    { key: "notes", label: "Notes", type: "textarea" },
  ];

  async function handleEditSave(values: Record<string, string | number>) {
    if (!editingPurchase) return;
    const qty = parseFloat(String(values.quantity));
    const rate = parseFloat(String(values.rate));
    await onEditPurchase(editingPurchase.id, {
      product_id: Number(values.product_id),
      date: String(values.date),
      quantity: qty,
      rate,
      total_amount: qty * rate,
      supplier: String(values.supplier),
      notes: String(values.notes),
    });
  }

  async function handleDelete() {
    if (!deletingPurchase) return;
    const stock = calculateProductStock(deletingPurchase.product_id, purchases, sales);
    const stockAfter = stock.stockLeft - Number(deletingPurchase.quantity);
    if (stockAfter < 0) {
      setError("Cannot delete: removing this purchase would make stock negative.");
      setDeletingPurchase(null);
      return;
    }
    try {
      await onDeletePurchase(deletingPurchase.id);
      setDeletingPurchase(null);
    } catch {
      setError("Error deleting purchase.");
      setDeletingPurchase(null);
    }
  }

  return (
    <div>
      <h3 className="section-title">Purchase History</h3>
      {error && (
        <div className="alert alert-danger">
          {error}
          <span style={{ float: "right", cursor: "pointer" }} onClick={() => setError(null)}>&times;</span>
        </div>
      )}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Total</th>
              <th>Supplier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>No purchases yet</td>
              </tr>
            ) : (
              purchases.map((p) => {
                const product = products.find((pr) => pr.id === p.product_id);
                return (
                  <tr key={p.id}>
                    <td>{p.date}</td>
                    <td>{product?.name || "Unknown"}</td>
                    <td>{Number(p.quantity).toFixed(2)}</td>
                    <td>{formatCurrency(Number(p.rate))}</td>
                    <td>{formatCurrency(Number(p.total_amount))}</td>
                    <td>{p.supplier || "-"}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-info btn-sm" onClick={() => setEditingPurchase(p)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeletingPurchase(p)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <EditModal
        open={editingPurchase !== null}
        title="Edit Purchase"
        fields={editFields}
        initialValues={
          editingPurchase
            ? {
                product_id: editingPurchase.product_id,
                date: editingPurchase.date,
                quantity: editingPurchase.quantity,
                rate: editingPurchase.rate,
                supplier: editingPurchase.supplier,
                notes: editingPurchase.notes,
              }
            : {}
        }
        onSave={handleEditSave}
        onClose={() => setEditingPurchase(null)}
      />

      <ConfirmDialog
        open={deletingPurchase !== null}
        title="Delete Purchase"
        message="Are you sure you want to delete this purchase? This may affect stock levels."
        onConfirm={handleDelete}
        onCancel={() => setDeletingPurchase(null)}
      />
    </div>
  );
}
