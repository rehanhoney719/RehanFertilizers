"use client";

import { useState } from "react";
import { Sale, Product } from "@/types";
import { formatCurrency } from "@/lib/calculations";
import StatCard from "./ui/StatCard";

interface LoansProps {
  sales: Sale[];
  products: Product[];
  onEditSale: (id: number, updates: Partial<Omit<Sale, "id" | "created_at">>) => Promise<Sale>;
}

export default function Loans({ sales, products, onEditSale }: LoansProps) {
  const loans = sales.filter((s) => Number(s.remaining_amount) > 0);
  const totalOutstanding = loans.reduce((sum, s) => sum + Number(s.remaining_amount), 0);
  const [payingSale, setPayingSale] = useState<Sale | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRecordPayment() {
    if (!payingSale) return;
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }
    const remaining = Number(payingSale.remaining_amount);
    if (amount > remaining) {
      setError(`Payment exceeds remaining amount (${formatCurrency(remaining)}).`);
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const newPaid = Number(payingSale.amount_paid) + amount;
      const newRemaining = remaining - amount;
      let newStatus: "cash" | "loan" | "partial" = "partial";
      if (newRemaining <= 0) {
        newStatus = "cash";
      }
      await onEditSale(payingSale.id, {
        amount_paid: newPaid,
        remaining_amount: newRemaining,
        payment_status: newStatus,
      });
      setPayingSale(null);
      setPaymentAmount("");
    } catch {
      setError("Error recording payment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 className="page-title">Loan Tracking</h2>
      <p className="page-subtitle">Monitor outstanding balances and record payments</p>

      <div className="dashboard-grid">
        <StatCard title="Outstanding" value={formatCurrency(totalOutstanding)} gradient="#dc2626" />
        <StatCard title="Active Loans" value={String(loans.length)} gradient="#d97706" />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Remaining</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loans.length === 0 ? (
              <tr>
                <td colSpan={10}>No pending loans</td>
              </tr>
            ) : (
              loans.map((sale) => {
                const product = products.find((p) => p.id === sale.product_id);
                let statusBadge: React.ReactNode;

                if (Number(sale.remaining_amount) === 0) {
                  statusBadge = <span className="badge badge-cash">Paid</span>;
                } else if (sale.due_date && new Date(sale.due_date) < new Date()) {
                  statusBadge = <span className="badge badge-loan">Overdue</span>;
                } else if (Number(sale.amount_paid) > 0) {
                  statusBadge = <span className="badge badge-partial">Partial</span>;
                } else {
                  statusBadge = <span className="badge badge-loan">Pending</span>;
                }

                return (
                  <tr key={sale.id}>
                    <td>{sale.date}</td>
                    <td>{sale.customer_name || "-"}</td>
                    <td>{sale.customer_phone || "-"}</td>
                    <td>{product ? product.name : "Unknown"}</td>
                    <td>{formatCurrency(Number(sale.total_amount))}</td>
                    <td>{formatCurrency(Number(sale.amount_paid))}</td>
                    <td><strong>{formatCurrency(Number(sale.remaining_amount))}</strong></td>
                    <td>{sale.due_date || "-"}</td>
                    <td>{statusBadge}</td>
                    <td>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => {
                          setPayingSale(sale);
                          setPaymentAmount("");
                          setError(null);
                        }}
                      >
                        Record Payment
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {payingSale && (
        <div className="modal active" onClick={() => setPayingSale(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3>Record Payment</h3>
              <span className="modal-close" onClick={() => setPayingSale(null)}>&times;</span>
            </div>
            <div className="info-bar">
              <strong>{payingSale.customer_name || "Customer"}</strong> — Remaining: {formatCurrency(Number(payingSale.remaining_amount))}
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="form-group">
              <label>Payment Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={String(payingSale.remaining_amount)}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setPayingSale(null)}>Cancel</button>
              <button className="btn btn-success" onClick={handleRecordPayment} disabled={saving}>
                {saving ? "Saving..." : "Record Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
