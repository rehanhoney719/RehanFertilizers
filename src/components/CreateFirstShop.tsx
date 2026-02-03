"use client";

import { useState } from "react";

interface CreateFirstShopProps {
  onCreateShop: (name: string) => Promise<unknown>;
}

export default function CreateFirstShop({ onCreateShop }: CreateFirstShopProps) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      setCreating(true);
      setError("");
      await onCreateShop(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create shop");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="create-first-shop">
      <div className="create-first-shop-card">
        <h2>Welcome to Ahsan Fertilizer & Crops Store</h2>
        <p>Create your first shop to get started.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="shop-name">Shop Name</label>
            <input
              id="shop-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Main Branch"
              autoFocus
              required
            />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={creating || !name.trim()}>
            {creating ? "Creating..." : "Create Shop"}
          </button>
        </form>
      </div>
    </div>
  );
}
