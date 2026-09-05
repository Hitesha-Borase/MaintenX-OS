import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Search, Filter, Download, DollarSign, FileText } from "lucide-react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { useApp } from "../../../context/AppContext";
import { InvoiceModal } from "./InvoiceModal";

export function PaymentsPage() {
  const { payments, markPaymentPaid, logInvoiceDownload } = useMasterAdmin();
  const { addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.company.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments.filter(p => p.status === "Paid").reduce((acc, curr) => acc + curr.amount, 0);

  const overdueAmount = payments.filter(p => p.status === "Overdue").reduce((acc, curr) => acc + curr.amount, 0);

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDownload = (invoiceId) => {
    logInvoiceDownload(invoiceId);
    addToast(`Downloading PDF for ${invoiceId}...`, "success");
  };

  const handleMarkPaid = (invoiceId) => {
    markPaymentPaid(invoiceId);
    addToast(`Invoice ${invoiceId} marked as paid!`, "success");
    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      // Update selected invoice state to show the change immediately in the modal
      setSelectedInvoice({ ...selectedInvoice, status: "Paid" });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", margin: 0 }}>
            Payments & Invoicing
          </h1>
        </div>
        <Button variant="outline" icon={Download} style={{ fontSize: "13px", padding: "8px 14px", fontWeight: 600 }}>
          Export Report
        </Button>
      </div>

      {/* Metric Cards - systematic compact grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 300px))", gap: "16px" }}>
        <StatCard
          title="TOTAL COLLECTED"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          colorVariant="emerald"
        />
        <StatCard
          title="OVERDUE PAYMENTS"
          value={`$${overdueAmount.toLocaleString()}`}
          icon={DollarSign}
          colorVariant="rose"
        />
      </div>

      <Card style={{ padding: "0", overflow: "hidden", borderRadius: "14px" }}>
        {/* Search & Filter Bar */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: "10px", flexWrap: "wrap", backgroundColor: "#FFFFFF" }}>
          <div style={{ flex: "1 1 100%", minWidth: "180px", position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search by invoice ID or company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "8px 12px 8px 34px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
            <Filter size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ flex: 1, minWidth: 0, padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", fontSize: "12px", fontWeight: 600 }}
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Mobile View: 2-Column Side-by-Side Invoice Cards (Aamne-Samne) */}
        <div className="mobile-cards-view grid-2" style={{ padding: "12px", gap: "10px" }}>
          {filteredPayments.map(payment => (
            <div 
              key={payment.id} 
              style={{ 
                padding: "12px", 
                backgroundColor: "var(--bg-card-subtle)", 
                borderRadius: "10px", 
                border: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "8px",
                minWidth: 0
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                  <span style={{ fontWeight: 800, fontSize: "12px", color: "var(--text-primary)", fontFamily: "monospace" }}>{payment.id}</span>
                  <Badge variant={payment.status === "Paid" ? "emerald" : payment.status === "Overdue" ? "destructive" : "warning"} style={{ fontSize: "10px", padding: "2px 6px" }}>
                    {payment.status}
                  </Badge>
                </div>

                <div style={{ marginTop: "6px" }}>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                    ${payment.amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-primary)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    🏢 {payment.company}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {payment.plan} • {payment.date}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end", paddingTop: "6px", borderTop: "1px solid var(--border-subtle)" }}>
                <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(payment)} title="View Invoice" style={{ padding: "4px" }}><FileText size={13} /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDownload(payment.id)} title="Download PDF" style={{ padding: "4px" }}><Download size={13} /></Button>
              </div>
            </div>
          ))}
          {filteredPayments.length === 0 && (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)", gridColumn: "1 / -1" }}>
              No payments found matching criteria.
            </div>
          )}
        </div>

        {/* Desktop View: Full Width Table */}
        <div className="desktop-table-view" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Invoice ID</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Company & Plan</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Amount</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Date</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-primary)" }}>{payment.id}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{payment.company}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{payment.plan}</div>
                  </td>
                  <td style={{ padding: "16px 20px", fontWeight: 700, color: "var(--text-primary)" }}>${payment.amount.toLocaleString()}</td>
                  <td style={{ padding: "16px 20px", fontSize: "13px", color: "var(--text-secondary)" }}>{payment.date}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <Badge variant={payment.status === "Paid" ? "emerald" : payment.status === "Overdue" ? "destructive" : "warning"}>
                      {payment.status}
                    </Badge>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(payment)} title="View Invoice"><FileText size={16} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(payment.id)} title="Download PDF"><Download size={16} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPayments.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
              No payments found matching criteria.
            </div>
          )}
        </div>
      </Card>

      <InvoiceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invoice={selectedInvoice}
        onDownload={handleDownload}
        onMarkPaid={handleMarkPaid}
      />
    </div>
  );
}
