"use client";

import { useState, useRef } from "react";
import { Product, Sale, Purchase, CropPurchase } from "@/types";
import { calculateProductStock } from "@/lib/calculations";
import StatCard from "./ui/StatCard";

interface BackupProps {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  cropPurchases: CropPurchase[];
  onReload: () => void;
}

export default function Backup({ products, sales, purchases, cropPurchases, onReload }: BackupProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);

  const totalTrans = sales.length + purchases.length + cropPurchases.length;

  async function exportToExcel() {
    setExporting(true);
    try {
      const XLSX = (await import("xlsx")).default;
      const wb = XLSX.utils.book_new();

      const salesData = sales.map((sale) => {
        const product = products.find((p) => p.id === sale.product_id);
        return {
          Date: sale.date,
          Product: product ? product.name : "Unknown",
          Quantity: sale.quantity,
          Rate: sale.rate,
          Amount: sale.total_amount,
          Profit: sale.profit || 0,
          Customer: sale.customer_name || "",
          Phone: sale.customer_phone || "",
          Status: sale.payment_status,
          Paid: sale.amount_paid || 0,
          Remaining: sale.remaining_amount || 0,
          Notes: sale.notes || "",
        };
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(salesData), "Sales");

      const purchasesData = purchases.map((purchase) => {
        const product = products.find((p) => p.id === purchase.product_id);
        return {
          Date: purchase.date,
          Product: product ? product.name : "Unknown",
          Quantity: purchase.quantity,
          Rate: purchase.rate,
          Amount: purchase.total_amount,
          Supplier: purchase.supplier || "",
          Notes: purchase.notes || "",
        };
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(purchasesData), "Purchases");

      const stockData = products.map((product) => {
        const stock = calculateProductStock(product.id, purchases, sales);
        return {
          Product: product.name,
          Category: product.category || "",
          Unit: product.unit,
          Bought: stock.totalBought.toFixed(2),
          Sold: stock.totalSold.toFixed(2),
          Stock: stock.stockLeft.toFixed(2),
          "Avg Rate": stock.avgPurchaseRate.toFixed(2),
          Value: stock.stockValue.toFixed(2),
          Profit: stock.totalProfit.toFixed(2),
        };
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(stockData), "Stock");

      XLSX.writeFile(wb, `Ahsan_Store_${new Date().toISOString().split("T")[0]}.xlsx`);
      window.alert("Exported to Excel!");
    } catch (error) {
      console.error("Excel export error:", error);
      window.alert("Error exporting Excel");
    } finally {
      setExporting(false);
    }
  }

  async function exportToPDF() {
    setExporting(true);
    try {
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default;
      await import("jspdf-autotable");

      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Ahsan Fertilizer Store", 14, 20);
      doc.setFontSize(12);
      doc.text(`Report - ${new Date().toLocaleDateString("en-PK")}`, 14, 28);

      let yPos = 40;
      const today = new Date().toISOString().split("T")[0];
      const todaySales = sales.filter((s) => s.date === today);
      const todaySalesTotal = todaySales.reduce((sum, s) => sum + Number(s.total_amount), 0);
      const todayProfit = todaySales.reduce((sum, s) => sum + Number(s.profit || 0), 0);

      doc.setFontSize(10);
      doc.text(`Today's Sales: Rs. ${todaySalesTotal.toLocaleString("en-PK")}`, 14, yPos);
      yPos += 6;
      doc.text(`Today's Profit: Rs. ${todayProfit.toLocaleString("en-PK")}`, 14, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.text("Current Stock", 14, yPos);
      yPos += 8;

      const stockHeaders = [["Product", "Stock", "Unit", "Value"]];
      const stockRows = products.map((product) => {
        const stock = calculateProductStock(product.id, purchases, sales);
        return [
          product.name,
          stock.stockLeft.toFixed(2),
          product.unit,
          `Rs. ${stock.stockValue.toFixed(0)}`,
        ];
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (doc as any).autoTable({
        startY: yPos,
        head: stockHeaders,
        body: stockRows,
        theme: "grid",
        styles: { fontSize: 8 },
      });

      doc.save(`Ahsan_Store_Report_${new Date().toISOString().split("T")[0]}.pdf`);
      window.alert("PDF generated!");
    } catch (error) {
      console.error("PDF error:", error);
      window.alert("Error generating PDF");
    } finally {
      setExporting(false);
    }
  }

  function downloadBackup() {
    const backupData = { products, sales, purchases, cropPurchases };
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Ahsan_Backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    window.alert("Backup downloaded!");
  }

  function handleRestore(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm("This will show restored data. Continue?")) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const restored = JSON.parse(e.target?.result as string);
        if (!restored.products || !restored.sales || !restored.purchases) {
          window.alert("Invalid backup file!");
          return;
        }
        window.alert(
          "Backup file validated! To restore data into Supabase, use the Supabase dashboard import or contact your admin."
        );
      } catch {
        window.alert("Error reading backup file");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div>
      <h2 className="page-title">Backup & Export</h2>
      <p className="page-subtitle">Export your data or create backups</p>

      <div className="dashboard-grid">
        <StatCard title="Transactions" value={String(totalTrans)} gradient="#2563eb" />
        <StatCard title="Data Source" value="Supabase" gradient="#059669" />
      </div>

      <div className="section-card">
        <h3 className="section-title" style={{ marginTop: 0 }}>Export Data</h3>
        <div className="action-buttons">
          <button className="btn btn-success" onClick={exportToExcel} disabled={exporting}>Export Excel</button>
          <button className="btn btn-info" onClick={exportToPDF} disabled={exporting}>Export PDF</button>
          <button className="btn btn-primary" onClick={downloadBackup}>Download Backup</button>
        </div>
      </div>

      <div className="section-card">
        <h3 className="section-title" style={{ marginTop: 0 }}>Restore</h3>
        <input type="file" ref={fileInputRef} accept=".json" onChange={handleRestore} />
        <p className="page-subtitle" style={{ marginTop: 8, marginBottom: 0, fontSize: 13 }}>Upload backup file to validate data</p>
      </div>

      <div className="section-card">
        <h3 className="section-title" style={{ marginTop: 0 }}>Refresh Data</h3>
        <button className="btn btn-warning" onClick={onReload}>Reload from Supabase</button>
      </div>
    </div>
  );
}
