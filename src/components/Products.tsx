"use client";

import { useState } from "react";
import { Product, Sale, Purchase } from "@/types";
import { calculateProductStock } from "@/lib/calculations";
import Alert from "./ui/Alert";
import EditModal, { EditField } from "./ui/EditModal";

interface ProductsProps {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  onAddProduct: (product: Omit<Product, "id" | "created_at">) => Promise<Product>;
  onDeleteProduct: (id: number) => Promise<void>;
  onEditProduct: (id: number, updates: Partial<Omit<Product, "id" | "created_at">>) => Promise<Product>;
}

const editFields: EditField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "category", label: "Category", type: "text" },
  {
    key: "unit",
    label: "Unit",
    type: "select",
    required: true,
    options: [
      { value: "bags", label: "Bags" },
      { value: "kg", label: "Kilograms" },
      { value: "ton", label: "Tons" },
      { value: "liters", label: "Liters" },
    ],
  },
  { key: "min_stock", label: "Min Stock Level", type: "number", required: true, step: "0.01", min: "0" },
];

export default function Products({
  products,
  sales,
  purchases,
  onAddProduct,
  onDeleteProduct,
  onEditProduct,
}: ProductsProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("bags");
  const [minStock, setMinStock] = useState("10");
  const [alert, setAlert] = useState<{ message: string; type: "success" | "danger" } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
      setAlert({ message: "Product added successfully!", type: "success" });
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

  async function handleEditSave(values: Record<string, string | number>) {
    if (!editingProduct) return;
    await onEditProduct(editingProduct.id, {
      name: String(values.name).trim(),
      category: String(values.category).trim(),
      unit: String(values.unit),
      min_stock: parseFloat(String(values.min_stock)),
    });
    setAlert({ message: "Product updated successfully!", type: "success" });
  }

  return (
    <div>
      <h2 className="page-title">Manage Products</h2>
      <p className="page-subtitle">Add, edit, and manage your product catalog</p>
      {alert && <Alert message={alert.message} type={alert.type} onDismiss={() => setAlert(null)} />}

      <div className="section-card">
        <h3 className="section-title" style={{ marginTop: 0 }}>Add Product</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Urea, DAP, etc." />
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
              <input type="number" step="0.01" min="0" value={minStock} onChange={(e) => setMinStock(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>

      <h3 className="section-title">All Products</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Stock</th>
              <th>Min Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const stock = calculateProductStock(product.id, purchases, sales);
              const isLow = stock.stockLeft < Number(product.min_stock);
              return (
                <tr key={product.id}>
                  <td><strong>{product.name}</strong></td>
                  <td>{product.category || "-"}</td>
                  <td>{product.unit}</td>
                  <td>
                    {stock.stockLeft.toFixed(2)}{" "}
                    <span className={`badge ${isLow ? "badge-loan" : "badge-cash"}`}>
                      {isLow ? "Low" : "OK"}
                    </span>
                  </td>
                  <td>{product.min_stock}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-info btn-sm" onClick={() => setEditingProduct(product)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <EditModal
        open={editingProduct !== null}
        title="Edit Product"
        fields={editFields}
        initialValues={editingProduct ? { name: editingProduct.name, category: editingProduct.category, unit: editingProduct.unit, min_stock: editingProduct.min_stock } : {}}
        onSave={handleEditSave}
        onClose={() => setEditingProduct(null)}
      />
    </div>
  );
}
