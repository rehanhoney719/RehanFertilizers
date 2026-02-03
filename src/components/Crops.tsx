"use client";

import { useState } from "react";
import { CropPurchase } from "@/types";
import { getCropInventory, formatCurrency, todayISO } from "@/lib/calculations";
import Alert from "./ui/Alert";
import EditModal, { EditField } from "./ui/EditModal";
import ConfirmDialog from "./ui/ConfirmDialog";

interface CropsProps {
  cropPurchases: CropPurchase[];
  onAddCropPurchase: (cp: Omit<CropPurchase, "id" | "created_at">) => Promise<CropPurchase>;
  onEditCropPurchase: (id: number, updates: Partial<Omit<CropPurchase, "id" | "created_at">>) => Promise<CropPurchase>;
  onDeleteCropPurchase: (id: number) => Promise<void>;
}

const editFields: EditField[] = [
  { key: "crop_type", label: "Crop Type", type: "text", required: true },
  { key: "date", label: "Date", type: "date", required: true },
  { key: "quantity", label: "Quantity (kg)", type: "number", required: true, step: "0.01", min: "0.01" },
  { key: "rate", label: "Rate/kg", type: "number", required: true, step: "0.01", min: "0" },
  { key: "supplier", label: "Supplier", type: "text" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "in_storage", label: "In Storage" },
      { value: "sold", label: "Sold" },
    ],
  },
  { key: "notes", label: "Notes", type: "textarea" },
];

export default function Crops({
  cropPurchases,
  onAddCropPurchase,
  onEditCropPurchase,
  onDeleteCropPurchase,
}: CropsProps) {
  const [cropType, setCropType] = useState("");
  const [date, setDate] = useState(todayISO());
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [alert, setAlert] = useState<{ message: string; type: "success" | "danger" } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropPurchase | null>(null);
  const [deletingCrop, setDeletingCrop] = useState<CropPurchase | null>(null);

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

  async function handleEditSave(values: Record<string, string | number>) {
    if (!editingCrop) return;
    const qty = parseFloat(String(values.quantity));
    const r = parseFloat(String(values.rate));
    await onEditCropPurchase(editingCrop.id, {
      crop_type: String(values.crop_type),
      date: String(values.date),
      quantity: qty,
      rate: r,
      total_amount: qty * r,
      supplier: String(values.supplier),
      status: String(values.status) as "in_storage" | "sold",
      notes: String(values.notes),
    });
    setAlert({ message: "✓ Crop purchase updated!", type: "success" });
  }

  async function handleDelete() {
    if (!deletingCrop) return;
    try {
      await onDeleteCropPurchase(deletingCrop.id);
      setDeletingCrop(null);
    } catch {
      setAlert({ message: "Error deleting crop purchase.", type: "danger" });
      setDeletingCrop(null);
    }
  }

  async function handleMarkAsSold(cp: CropPurchase) {
    try {
      await onEditCropPurchase(cp.id, { status: "sold" });
      setAlert({ message: "✓ Marked as sold!", type: "success" });
    } catch {
      setAlert({ message: "Error updating status.", type: "danger" });
    }
  }

  return (
    <div>
      <h2 className="page-title">Crops Management</h2>
      <p className="page-subtitle">Track crops bought from suppliers and sold to factories</p>

      {alert && <Alert message={alert.message} type={alert.type} onDismiss={() => setAlert(null)} />}

      <h3 className="section-title">Add Crop Purchase</h3>
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

      <h3 className="section-title">Crop Inventory</h3>
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

      <h3 className="section-title">All Crop Purchases</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Crop</th>
              <th>Qty (kg)</th>
              <th>Rate</th>
              <th>Total</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cropPurchases.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center" }}>No crop purchases yet</td>
              </tr>
            ) : (
              cropPurchases.map((cp) => (
                <tr key={cp.id}>
                  <td>{cp.date}</td>
                  <td><strong>{cp.crop_type}</strong></td>
                  <td>{Number(cp.quantity).toFixed(2)}</td>
                  <td>Rs. {Number(cp.rate).toFixed(2)}/kg</td>
                  <td>{formatCurrency(Number(cp.total_amount))}</td>
                  <td>{cp.supplier || "-"}</td>
                  <td>
                    {cp.status === "in_storage" ? (
                      <span className="badge badge-partial">In Storage</span>
                    ) : (
                      <span className="badge badge-cash">Sold</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {cp.status === "in_storage" && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleMarkAsSold(cp)}
                        >
                          Mark Sold
                        </button>
                      )}
                      <button className="btn btn-info btn-sm" onClick={() => setEditingCrop(cp)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeletingCrop(cp)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EditModal
        open={editingCrop !== null}
        title="Edit Crop Purchase"
        fields={editFields}
        initialValues={
          editingCrop
            ? {
                crop_type: editingCrop.crop_type,
                date: editingCrop.date,
                quantity: editingCrop.quantity,
                rate: editingCrop.rate,
                supplier: editingCrop.supplier,
                status: editingCrop.status,
                notes: editingCrop.notes,
              }
            : {}
        }
        onSave={handleEditSave}
        onClose={() => setEditingCrop(null)}
      />

      <ConfirmDialog
        open={deletingCrop !== null}
        title="Delete Crop Purchase"
        message="Are you sure you want to delete this crop purchase?"
        onConfirm={handleDelete}
        onCancel={() => setDeletingCrop(null)}
      />
    </div>
  );
}
