"use client";

import { Sale } from "@/types";
import { getCustomerSummaries, formatCurrency } from "@/lib/calculations";

interface CustomersProps {
  sales: Sale[];
}

export default function Customers({ sales }: CustomersProps) {
  const customers = getCustomerSummaries(sales);

  return (
    <div>
      <h2 style={{ marginBottom: 15, color: "#34495e" }}>Customers</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Total Purchases</th>
              <th>Outstanding</th>
              <th>Last Purchase</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  No customers yet
                </td>
              </tr>
            ) : (
              customers.map((customer) => {
                const loanClass = customer.outstandingLoans > 0 ? "profit-negative" : "profit-positive";
                return (
                  <tr key={customer.name}>
                    <td>
                      <strong>{customer.name}</strong>
                    </td>
                    <td>{customer.phone}</td>
                    <td>{customer.address}</td>
                    <td>{formatCurrency(customer.totalPurchases)}</td>
                    <td className={loanClass}>
                      <strong>{formatCurrency(customer.outstandingLoans)}</strong>
                    </td>
                    <td>{customer.lastPurchase}</td>
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
