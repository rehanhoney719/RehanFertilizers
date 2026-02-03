"use client";

import { useState, useEffect } from "react";

export interface EditField {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  options?: { value: string; label: string }[];
  required?: boolean;
  step?: string;
  min?: string;
  readOnly?: boolean;
}

interface EditModalProps {
  open: boolean;
  title: string;
  fields: EditField[];
  initialValues: Record<string, string | number>;
  onSave: (values: Record<string, string | number>) => Promise<void>;
  onClose: () => void;
}

export default function EditModal({
  open,
  title,
  fields,
  initialValues,
  onSave,
  onClose,
}: EditModalProps) {
  const [values, setValues] = useState<Record<string, string | number>>(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setError(null);
  }, [initialValues, open]);

  if (!open) return null;

  function handleChange(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await onSave(values);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <span className="modal-close" onClick={onClose}>&times;</span>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div className="form-group" key={field.key}>
              <label>{field.label}{field.required && " *"}</label>
              {field.type === "select" ? (
                <select
                  value={String(values[field.key] ?? "")}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  disabled={field.readOnly}
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  value={String(values[field.key] ?? "")}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  readOnly={field.readOnly}
                />
              ) : (
                <input
                  type={field.type}
                  value={String(values[field.key] ?? "")}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  step={field.step}
                  min={field.min}
                  readOnly={field.readOnly}
                />
              )}
            </div>
          ))}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
