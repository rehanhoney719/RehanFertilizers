"use client";

import { useState } from "react";
import { Product, Sale, Purchase } from "@/types";
import { calculateProductStock } from "@/lib/calculations";
import Alert from "./ui/Alert";

interface ProductsProps {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  onAddProduct: (product: Omit<Product, "id" | "created_at">) => Promise<Product>;
  onDeleteProduct: (id: number) => Promise<void>;
}

export default function Products({
  products,
  sales,
  purchases,
  onAddProduct,
  onDeleteProduct,
}: ProductsProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("bags");
  const [minStock, setMinStock] = useState("10");
  const [alert, setAlert] = useState<{ message: string; type: "success" | "danger" } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();

    if (products.some((p) => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      setAlert({ message: "Product already exists!", type: "danger" });
      return;
    }

    try {
      setSubmitting(true);
      await onAddProduct({
        name: trimmedName,
        category: category.trim(),
        unit,
        min_stock: parseFloat(minStock),
      });
      setAlert({ message: "✓ Product added!", type: "success" });
      setName("");
      setCategory("");
      setUnit("bags");
      setMinStock("10");
    } catch {
      setAlert({ message: "Error adding product.", type: "danger" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(productId: number) {
    const stock = calculateProductStock(productId, purchases, sales);
    if (stock.totalBought > 0 || stock.totalSold > 0) {
      window.alert("Cannot delete product with transactions!");
      return;
    }
    if (window.confirm("Delete this product?")) {
      try {
        await onDeleteProduct(productId);
      } catch {
        setAlert({ message: "Error deleting product.", type: "danger" });
      }
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 15, color: "#34495e" }}>Manage Products</h2>
      {alert && <Alert message={alert.message} type={alert.type} onDismiss={() => setAlert(null)} />}

      <h3 style={{ marginBottom: 10, color: "#34495e" }}>Add Product</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Urea, DAP, etc."
            />
          </div>
          <div className="form-group">
            <label>Unit *</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} required>
              <option value="bags">Bags</option>
              <option value="kg">Kilograms</option>
              <option value="ton">Tons</option>
              <option value="liters">Liters</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Min Stock Level *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Adding..." : "➕ Add Product"}
        </button>
      </form>

      <h3 style={{ margin: "25px 0 15px", color: "#34495e" }}>All Products</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Stock</th>
              <th>Min Level</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const stock = calculateProductStock(product.id, purchases, sales);
              const stockStatus =
                stock.stockLeft < Number(product.min_stock) ? (
                  <span style={{ color: "#e74c3c" }}>⚠️ Low</span>
                ) : (
                  <span style={{ color: "#27ae60" }}>✓ OK</span>
                );

              return (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                  </td>
                  <td>{product.category || "-"}</td>
                  <td>{product.unit}</td>
                  <td>
                    {stock.stockLeft.toFixed(2)} {stockStatus}
                  </td>
                  <td>{product.min_stock}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(product.id)}
                      style={{ padding: "6px 12px", fontSize: 13 }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
