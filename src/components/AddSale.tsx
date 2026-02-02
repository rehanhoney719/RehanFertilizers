"use client";

import { useState, useMemo } from "react";
import { Product, Sale, Purchase } from "@/types";
import { calculateProductStock, formatCurrency, todayISO } from "@/lib/calculations";
import Alert from "./ui/Alert";

interface AddSaleProps {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  onAddSale: (sale: Omit<Sale, "id" | "created_at">) => Promise<Sale>;
  onSuccess: () => void;
}

export default function AddSale({ products, sales, purchases, onAddSale, onSuccess }: AddSaleProps) {
  const [date, setDate] = useState(todayISO());
  const [productId, setProductId] = useState<number | "">("");
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [isLoan, setIsLoan] = useState(false);
  const [amountPaid, setAmountPaid] = useState("0");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [alert, setAlert] = useState<{ message: string; type: "success" | "danger" } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedProduct = products.find((p) => p.id === productId);
  const stock = useMemo(
    () => (productId ? calculateProductStock(Number(productId), purchases, sales) : null),
    [productId, purchases, sales]
  );

  const totalAmount = (parseFloat(quantity) || 0) * (parseFloat(rate) || 0);
  const expectedProfit =
    stock && parseFloat(quantity) > 0 && parseFloat(rate) > 0
      ? parseFloat(quantity) * (parseFloat(rate) - stock.avgPurchaseRate)
      : 0;
  const remaining = totalAmount - (parseFloat(amountPaid) || 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || !stock) return;

    const qty = parseFloat(quantity);
    if (qty > stock.stockLeft) {
      setAlert({ message: "Error: Not enough stock!", type: "danger" });
      return;
    }

    const saleRate = parseFloat(rate);
    const total = qty * saleRate;
    const profit = qty * (saleRate - stock.avgPurchaseRate);

    let paymentStatus: "cash" | "loan" | "partial" = "cash";
    let paid = total;
    let remainingAmount = 0;
    let saleDueDate: string | null = null;

    if (isLoan) {
      paid = parseFloat(amountPaid) || 0;
      remainingAmount = total - paid;
      saleDueDate = dueDate || null;
      paymentStatus = remainingAmount > 0 ? (paid > 0 ? "partial" : "loan") : "cash";
    }

    try {
      setSubmitting(true);
      await onAddSale({
        product_id: Number(productId),
        quantity: qty,
        rate: saleRate,
        total_amount: total,
        profit,
        date,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        payment_status: paymentStatus,
        amount_paid: paid,
        remaining_amount: remainingAmount,
        due_date: saleDueDate,
        notes,
      });
      setAlert({ message: "✓ Sale added successfully!", type: "success" });
      setTimeout(onSuccess, 1500);
    } catch {
      setAlert({ message: "Error adding sale. Please try again.", type: "danger" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 15, color: "#34495e" }}>Add New Sale</h2>
      {alert && <Alert message={alert.message} type={alert.type} onDismiss={() => setAlert(null)} />}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Product *</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value ? Number(e.target.value) : "")}
              required
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Quantity *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            {selectedProduct && <small>({selectedProduct.unit})</small>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Sale Rate *</label>
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
            <label>Total Amount</label>
            <input type="number" value={totalAmount.toFixed(2)} readOnly />
          </div>
          <div className="form-group">
            <label>Available Stock</label>
            <input
              type="text"
              value={stock ? `${stock.stockLeft.toFixed(2)} ${selectedProduct?.unit || ""}` : ""}
              readOnly
            />
          </div>
        </div>

        <h3 style={{ margin: "15px 0 10px", color: "#34495e" }}>Customer Details</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Customer Name</label>
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
          </div>
        </div>

        <h3 style={{ margin: "15px 0 10px", color: "#34495e" }}>Payment</h3>
        <div className="toggle-switch">
          <span>Cash</span>
          <label className="switch">
            <input type="checkbox" checked={isLoan} onChange={(e) => setIsLoan(e.target.checked)} />
            <span className="slider"></span>
          </label>
          <span>Loan</span>
        </div>

        {isLoan && (
          <div className="form-row">
            <div className="form-group">
              <label>Amount Paid Now</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Remaining</label>
              <input type="number" value={remaining.toFixed(2)} readOnly />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div style={{ background: "#f8f9fa", padding: 10, borderRadius: 5, margin: "10px 0" }}>
          <strong>Expected Profit: </strong>
          <span className={expectedProfit >= 0 ? "profit-positive" : "profit-negative"}>
            {formatCurrency(expectedProfit)}
          </span>
        </div>

        <button type="submit" className="btn btn-success" disabled={submitting}>
          {submitting ? "Adding..." : "💰 Add Sale"}
        </button>
      </form>
    </div>
  );
}
