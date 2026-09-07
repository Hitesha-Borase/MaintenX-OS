import React, { useState } from "react";
import {
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  FileText,
  UserCheck,
  X
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useApp } from "../../context/AppContext";

export function QAReleasePage() {
  const { addToast } = useApp();

  const [releaseQueue, setReleaseQueue] = useState([
    { id: "REL-401", lotNo: "LOT-CIT-0830", product: "Sparkling Citrus Soda 500ml", units: 48000, coaStatus: "CoA Complete", microStatus: "Negative (Pass)", releaseStatus: "Pending Release" },
    { id: "REL-402", lotNo: "LOT-GIN-0830", product: "Organic Ginger Beer 330ml Can", units: 36000, coaStatus: "CoA Complete", microStatus: "Negative (Pass)", releaseStatus: "Released by QA" }
  ]);

  const [selectedLotForSignoff, setSelectedLotForSignoff] = useState(null);

  const handleSignoff = (lot) => {
    setReleaseQueue((prev) =>
      prev.map((r) => (r.id === lot.id ? { ...r, releaseStatus: "Released by QA" } : r))
    );
    addToast(`Batch Lot ${lot.lotNo} officially released for global distribution!`, "success");
    setSelectedLotForSignoff(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              QA Batch Release & Certificate of Analysis (CoA)
            </h1>
            <Badge variant="emerald">21 CFR Part 11 Compliant</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Digital batch disposition, electronic Certificate of Analysis verification, microbiological release, and warehouse shipment sign-offs.
          </p>
        </div>
      </div>

      {/* Release Queue Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
            Finished Goods QA Release Sign-Off Queue
          </h3>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Release Ref</th>
                <th>Finished Lot #</th>
                <th>Product SKU</th>
                <th>Packaged Units</th>
                <th>Certificate of Analysis</th>
                <th>Microbiology Lab</th>
                <th>Release Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {releaseQueue.map((r) => {
                const isPending = r.releaseStatus === "Pending Release";

                return (
                  <tr key={r.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{r.id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{r.lotNo}</div>
                    </td>
                    <td>
                      <span style={{ color: "var(--text-primary)", fontSize: "12px" }}>{r.product}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        {r.units.toLocaleString()} units
                      </span>
                    </td>
                    <td>
                      <Badge variant="cyan">{r.coaStatus}</Badge>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "#10B981", fontWeight: 600 }}>{r.microStatus}</span>
                    </td>
                    <td>
                      <Badge variant={isPending ? "amber" : "emerald"}>
                        {r.releaseStatus}
                      </Badge>
                    </td>
                    <td>
                      {isPending ? (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={ShieldCheck}
                          onClick={() => setSelectedLotForSignoff(r)}
                        >
                          Sign Off
                        </Button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>● Shipped Ready</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ELECTRONIC SIGNOFF MODAL */}
      {selectedLotForSignoff && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "540px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Authorize QA Batch Release
                </h2>
                <div style={{ fontSize: "12px", color: "#38BDF8" }}>
                  Lot: {selectedLotForSignoff.lotNo} — {selectedLotForSignoff.product}
                </div>
              </div>
              <button onClick={() => setSelectedLotForSignoff(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                <div style={{ fontWeight: 700, color: "#FFFFFF", marginBottom: "6px" }}>Verified Quality Parameters:</div>
                <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "4px", color: "var(--text-secondary)", fontSize: "12px" }}>
                  <li>✓ Microbiological 48h culture swab: Negative</li>
                  <li>✓ Refractometry Brix test: 10.4 °Bx (Spec: 10.2 - 10.6)</li>
                  <li>✓ Cap induction seal & torque test: 15.2 in-lbs (Spec: &gt; 12)</li>
                  <li>✓ Net fill volume: 500.8 ml (Spec: 500 ± 5ml)</li>
                  <li>✓ Allergen clean verification: Clear</li>
                </ul>
              </div>

              <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                By clicking Authorize, you legally certify that this manufacturing lot complies with all FDA 21 CFR, HACCP, and ISO 22000 quality standards.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setSelectedLotForSignoff(null)}>
                  Cancel
                </Button>
                <Button variant="primary" icon={FileCheck} onClick={() => handleSignoff(selectedLotForSignoff)}>
                  Authorize & Release
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
