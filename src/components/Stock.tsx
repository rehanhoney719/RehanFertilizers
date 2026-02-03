"use client";

import { Product, Sale, Purchase } from "@/types";
import { calculateProductStock, formatCurrency } from "@/lib/calculations";

interface StockProps {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
}

export default function Stock({ products, sales, purchases }: StockProps) {
  return (
    <div>
      <h2 className="page-title">Current Stock</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Unit</th>
              <th>Bought</th>
              <th>Sold</th>
              <th>Stock</th>
              <th>Avg Rate</th>
              <th>Value</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const stock = calculateProductStock(product.id, purchases, sales);
              const profitClass = stock.totalProfit >= 0 ? "profit-positive" : "profit-negative";

              return (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                  </td>
                  <td>{product.unit}</td>
                  <td>{stock.totalBought.toFixed(2)}</td>
                  <td>{stock.totalSold.toFixed(2)}</td>
                  <td>
                    <strong>{stock.stockLeft.toFixed(2)}</strong>
                  </td>
                  <td>Rs. {stock.avgPurchaseRate.toFixed(2)}</td>
                  <td>{formatCurrency(stock.stockValue)}</td>
                  <td className={profitClass}>{formatCurrency(stock.totalProfit)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
