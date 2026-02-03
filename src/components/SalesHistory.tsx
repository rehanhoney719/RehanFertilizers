"use client";

import { useState } from "react";
import { Product, Sale, Purchase } from "@/types";
import { formatCurrency, calculateProductStock } from "@/lib/calculations";
import EditModal, { EditField } from "./ui/EditModal";
import ConfirmDialog from "./ui/ConfirmDialog";

interface SalesHistoryProps {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  onEditSale: (id: number, updates: Partial<Omit<Sale, "id" | "created_at">>) => Promise<Sale>;
  onDeleteSale: (id: number) => Promise<void>;
}

export default function SalesHistory({
  products,
  sales,
  purchases,
  onEditSale,
  onDeleteSale,
}: SalesHistoryProps) {
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [deletingSale, setDeletingSale] = useState<Sale | null>(null);
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
    { key: "customer_name", label: "Customer Name", type: "text" },
    { key: "customer_phone", label: "Phone", type: "text" },
    { key: "customer_address", label: "Address", type: "text" },
    { key: "amount_paid", label: "Amount Paid", type: "number", step: "0.01", min: "0" },
    { key: "due_date", label: "Due Date", type: "date" },
    { key: "notes", label: "Notes", type: "textarea" },
  ];

  async function handleEditSave(values: Record<string, string | number>) {
    if (!editingSale) return;
    const qty = parseFloat(String(values.quantity));
    const rate = parseFloat(String(values.rate));
    const total = qty * rate;
    const paid = parseFloat(String(values.amount_paid)) || 0;
    const remaining = total - paid;

    // Check stock: available = current stock + old sale quantity (since we're replacing)
    const productId = Number(values.product_id);
    const stock = calculateProductStock(productId, purchases, sales);
    const availableStock = stock.stockLeft + Number(editingSale.quantity);
    if (qty > availableStock) {
      throw new Error(`Not enough stock. Available: ${availableStock.toFixed(2)}`);
    }

    const avgPurchaseRate = stock.avgPurchaseRate;
    const profit = qty * (rate - avgPurchaseRate);

    let paymentStatus: "cash" | "loan" | "partial" = "cash";
    if (remaining > 0) {
      paymentStatus = paid > 0 ? "partial" : "loan";
    }

    await onEditSale(editingSale.id, {
      product_id: productId,
      date: String(values.date),
      quantity: qty,
      rate,
      total_amount: total,
      profit,
      customer_name: String(values.customer_name),
      customer_phone: String(values.customer_phone),
      customer_address: String(values.customer_address),
      payment_status: paymentStatus,
      amount_paid: paid,
      remaining_amount: remaining,
      due_date: String(values.due_date) || null,
      notes: String(values.notes),
    });
  }

  async function handleDelete() {
    if (!deletingSale) return;
    try {
      await onDeleteSale(deletingSale.id);
      setDeletingSale(null);
    } catch {
      setError("Error deleting sale.");
      setDeletingSale(null);
    }
  }

  return (
    <div>
      <h3 className="section-title">Sales History</h3>
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
              <th>Customer</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center" }}>No sales yet</td>
              </tr>
            ) : (
              sales.map((sale) => {
                const product = products.find((p) => p.id === sale.product_id);
                let statusBadge: React.ReactNode;
                if (sale.payment_status === "cash") {
                  statusBadge = <span className="badge badge-cash">Cash</span>;
                } else if (sale.payment_status === "partial") {
                  statusBadge = <span className="badge badge-partial">Partial</span>;
                } else {
                  statusBadge = <span className="badge badge-loan">Loan</span>;
                }
                return (
                  <tr key={sale.id}>
                    <td>{sale.date}</td>
                    <td>{product?.name || "Unknown"}</td>
                    <td>{Number(sale.quantity).toFixed(2)}</td>
                    <td>{formatCurrency(Number(sale.rate))}</td>
                    <td>{formatCurrency(Number(sale.total_amount))}</td>
                    <td>{sale.customer_name || "-"}</td>
                    <td>{statusBadge}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-info btn-sm" onClick={() => setEditingSale(sale)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeletingSale(sale)}>
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
        open={editingSale !== null}
        title="Edit Sale"
        fields={editFields}
        initialValues={
          editingSale
            ? {
                product_id: editingSale.product_id,
                date: editingSale.date,
                quantity: editingSale.quantity,
                rate: editingSale.rate,
                customer_name: editingSale.customer_name,
                customer_phone: editingSale.customer_phone,
                customer_address: editingSale.customer_address,
                amount_paid: editingSale.amount_paid,
                due_date: editingSale.due_date || "",
                notes: editingSale.notes,
              }
            : {}
        }
        onSave={handleEditSave}
        onClose={() => setEditingSale(null)}
      />

      <ConfirmDialog
        open={deletingSale !== null}
        title="Delete Sale"
        message="Are you sure you want to delete this sale? Stock will be restored."
        onConfirm={handleDelete}
        onCancel={() => setDeletingSale(null)}
      />
    </div>
  );
}
