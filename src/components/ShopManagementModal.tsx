"use client";

import { useState } from "react";
import { Shop } from "@/types";

interface ShopManagementModalProps {
  shops: Shop[];
  currentShopId: number | null;
  onClose: () => void;
  onCreateShop: (name: string) => Promise<unknown>;
  onRenameShop: (id: number, name: string) => Promise<unknown>;
  onDeleteShop: (id: number) => Promise<unknown>;
}

export default function ShopManagementModal({
  shops,
  currentShopId,
  onClose,
  onCreateShop,
  onRenameShop,
  onDeleteShop,
}: ShopManagementModalProps) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    try {
      setAdding(true);
      setError("");
      await onCreateShop(trimmed);
      setNewName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create shop");
    } finally {
      setAdding(false);
    }
  }

  async function handleRename(id: number) {
    const trimmed = editName.trim();
    if (!trimmed) return;
    try {
      setError("");
      await onRenameShop(id, trimmed);
      setEditingId(null);
      setEditName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename shop");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this shop and all its data? This cannot be undone.")) return;
    try {
      setError("");
      await onDeleteShop(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete shop");
    }
  }

  function startEditing(shop: Shop) {
    setEditingId(shop.id);
    setEditName(shop.name);
  }

  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Manage Shops</h3>
          <span className="modal-close" onClick={onClose}>&times;</span>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="shop-list">
          {shops.map((shop) => (
            <div key={shop.id} className="shop-list-item">
              {editingId === shop.id ? (
                <div className="shop-edit-row">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(shop.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                  />
                  <button className="btn btn-sm btn-primary" onClick={() => handleRename(shop.id)}>
                    Save
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span className="shop-list-name">
                    {shop.name}
                    {shop.id === currentShopId && <span className="badge badge-cash">Active</span>}
                  </span>
                  <div className="action-buttons">
                    <button className="btn btn-sm btn-ghost" onClick={() => startEditing(shop)}>
                      Rename
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(shop.id)}
                      disabled={shops.length === 1}
                      title={shops.length === 1 ? "Cannot delete the only shop" : "Delete shop"}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleAdd} className="shop-add-form">
          <div className="form-group">
            <label>Add New Shop</label>
            <div className="shop-add-row">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Shop name"
              />
              <button type="submit" className="btn btn-sm btn-primary" disabled={adding || !newName.trim()}>
                {adding ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
