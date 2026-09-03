import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Payments & Invoicing</h1>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="outline" icon={Download}>Export Report</Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", borderTop: `4px solid #10B981` }}>
          <div style={{ padding: "12px", backgroundColor: `#10B98115`, borderRadius: "12px", color: "#10B981" }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }}>Total Collected (YTD)</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>${totalRevenue.toLocaleString()}</div>
          </div>
        </Card>
        <Card style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", borderTop: `4px solid #EF4444` }}>
          <div style={{ padding: "12px", backgroundColor: `#EF444415`, borderRadius: "12px", color: "#EF4444" }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }}>Overdue Payments</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>${overdueAmount.toLocaleString()}</div>
          </div>
        </Card>
      </div>

      <Card style={{ padding: "0" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-color)", display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search by invoice ID or company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "10px 10px 10px 40px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Filter size={16} color="var(--text-secondary)" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)", color: "var(--text-primary)" }}
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
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
