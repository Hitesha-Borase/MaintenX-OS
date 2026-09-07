import React from "react";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { FileText, Download, CheckCircle, AlertCircle } from "lucide-react";

export function InvoiceModal({ isOpen, onClose, invoice = null, onDownload, onMarkPaid }) {
  if (!invoice) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice ${invoice.id}`}
      subtitle={`Billing details for ${invoice.company}`}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <div style={{ display: "flex", gap: "12px" }}>
            {invoice.status === "Overdue" && (
              <Button variant="success" icon={CheckCircle} onClick={() => onMarkPaid(invoice.id)}>
                Mark as Paid
              </Button>
            )}
            <Button variant="primary" icon={Download} onClick={() => onDownload(invoice.id)}>
              Download PDF
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Status Banner */}
        <div style={{ 
          padding: "16px", 
          borderRadius: "var(--radius-lg)", 
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          backgroundColor: invoice.status === "Paid" ? "rgba(16, 185, 129, 0.1)" : invoice.status === "Overdue" ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)",
          color: invoice.status === "Paid" ? "#059669" : invoice.status === "Overdue" ? "#DC2626" : "#D97706",
          border: `1px solid ${invoice.status === "Paid" ? "rgba(16, 185, 129, 0.2)" : invoice.status === "Overdue" ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)"}`
        }}>
          {invoice.status === "Paid" ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <div>
            <div style={{ fontWeight: 800, fontSize: "16px" }}>Status: {invoice.status.toUpperCase()}</div>
            <div style={{ fontSize: "13px", opacity: 0.9 }}>
              {invoice.status === "Paid" 
                ? `Payment received via ${invoice.method} on ${invoice.date}.` 
                : `Payment was due on ${invoice.date}. Please collect immediately.`}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          
          {/* Header */}
          <div style={{ padding: "20px", backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>{invoice.company}</div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>Billed to Primary Admin</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Invoice Date</div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{invoice.date}</div>
            </div>
          </div>

          {/* Line Items */}
          <div style={{ padding: "0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Description</th>
                  <th style={{ padding: "12px 20px", textAlign: "right", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>Subscription: {invoice.plan}</div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>Platform access and selected modules</div>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right", fontWeight: 600, color: "var(--text-primary)" }}>
                    ${invoice.amount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ padding: "20px", backgroundColor: "var(--bg-main)", display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "200px", fontSize: "14px", color: "var(--text-secondary)" }}>
              <span>Subtotal:</span>
              <span>${invoice.amount.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", width: "200px", fontSize: "14px", color: "var(--text-secondary)" }}>
              <span>Tax (0%):</span>
              <span>$0</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", width: "200px", fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", paddingTop: "8px", borderTop: "1px solid var(--border-color)" }}>
              <span>Total:</span>
              <span>${invoice.amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
}
