"use client";

import { Sale, Product } from "@/types";
import { formatCurrency } from "@/lib/calculations";
import StatCard from "./ui/StatCard";

interface LoansProps {
  sales: Sale[];
  products: Product[];
}

export default function Loans({ sales, products }: LoansProps) {
  const loans = sales.filter((s) => Number(s.remaining_amount) > 0);
  const totalOutstanding = loans.reduce((sum, s) => sum + Number(s.remaining_amount), 0);

  return (
    <div>
      <h2 style={{ marginBottom: 15, color: "#34495e" }}>Loan Tracking</h2>

      <div className="dashboard-grid" style={{ marginBottom: 20 }}>
        <StatCard title="Outstanding" value={formatCurrency(totalOutstanding)} gradient="#e74c3c" />
        <StatCard title="Total Loans" value={String(loans.length)} gradient="#f39c12" />
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
            </tr>
          </thead>
          <tbody>
            {loans.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center" }}>
                  No pending loans
                </td>
              </tr>
            ) : (
              loans.map((sale) => {
                const product = products.find((p) => p.id === sale.product_id);
                let statusBadge: React.ReactNode;

                if (Number(sale.remaining_amount) === 0) {
                  statusBadge = <span className="badge badge-cash">Paid</span>;
                } else if (sale.due_date && new Date(sale.due_date) < new Date()) {
                  statusBadge = (
                    <span className="badge" style={{ background: "#c0392b", color: "white" }}>
                      Overdue
                    </span>
                  );
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
                    <td>
                      <strong>{formatCurrency(Number(sale.remaining_amount))}</strong>
                    </td>
                    <td>{sale.due_date || "-"}</td>
                    <td>{statusBadge}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
