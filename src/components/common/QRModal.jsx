import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { QrCode, Download, Printer, Copy, Check } from "lucide-react";
import { useApp } from "../../context/AppContext";

export function QRModal() {
  const { qrModalData, closeQrModal, addToast } = useApp();
  const [copied, setCopied] = React.useState(false);

  if (!qrModalData) return null;

  const { title = "Asset QR Code", code = "FLOW-001", meta = {} } = qrModalData;

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    addToast(`QR Code identifier '${code}' copied to clipboard.`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    addToast(`Sending QR Label for '${code}' to Zebra Industrial Barcode Printer.`);
  };

  return (
    <Modal
      isOpen={!!qrModalData}
      onClose={closeQrModal}
      title={title}
      subtitle={`Industrial QR / 2D DataMatrix for mobile shop-floor scanning`}
      maxWidth="480px"
      footer={
        <>
          <Button variant="secondary" onClick={closeQrModal}>
            Close
          </Button>
          <Button variant="primary" icon={Printer} onClick={handlePrint}>
            Print Label
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", textAlign: "center" }}>
        <div
          style={{
            padding: "20px",
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #38BDF8"
          }}
        >
          {/* High visual quality simulated SVG QR Matrix */}
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
            <rect width="180" height="180" fill="#FFFFFF" />
            {/* Top-Left Corner Box */}
            <rect x="15" y="15" width="40" height="40" fill="#0F172A" rx="4" />
            <rect x="23" y="23" width="24" height="24" fill="#FFFFFF" />
            <rect x="29" y="29" width="12" height="12" fill="#0284C7" rx="2" />
            
            {/* Top-Right Corner Box */}
            <rect x="125" y="15" width="40" height="40" fill="#0F172A" rx="4" />
            <rect x="133" y="23" width="24" height="24" fill="#FFFFFF" />
            <rect x="139" y="29" width="12" height="12" fill="#0284C7" rx="2" />

            {/* Bottom-Left Corner Box */}
            <rect x="15" y="125" width="40" height="40" fill="#0F172A" rx="4" />
            <rect x="23" y="133" width="24" height="24" fill="#FFFFFF" />
            <rect x="29" y="139" width="12" height="12" fill="#0284C7" rx="2" />

            {/* Dynamic Data Matrix Blocks */}
            <rect x="65" y="20" width="10" height="10" fill="#0F172A" />
            <rect x="80" y="20" width="10" height="10" fill="#0F172A" />
            <rect x="100" y="20" width="10" height="10" fill="#0F172A" />
            <rect x="65" y="35" width="10" height="10" fill="#0284C7" />
            <rect x="95" y="35" width="15" height="10" fill="#0F172A" />
            
            <rect x="20" y="65" width="10" height="10" fill="#0F172A" />
            <rect x="35" y="75" width="10" height="10" fill="#0F172A" />
            <rect x="65" y="65" width="20" height="20" fill="#0F172A" rx="2" />
            <rect x="95" y="65" width="10" height="10" fill="#0284C7" />
            <rect x="115" y="65" width="20" height="10" fill="#0F172A" />
            <rect x="145" y="65" width="15" height="10" fill="#0F172A" />

            <rect x="65" y="95" width="10" height="20" fill="#0F172A" />
            <rect x="85" y="95" width="20" height="10" fill="#0284C7" />
            <rect x="115" y="95" width="10" height="10" fill="#0F172A" />
            <rect x="135" y="85" width="25" height="10" fill="#0F172A" />
            <rect x="140" y="105" width="20" height="20" fill="#0F172A" />

            <rect x="65" y="125" width="10" height="10" fill="#0F172A" />
            <rect x="80" y="135" width="25" height="10" fill="#0F172A" />
            <rect x="115" y="125" width="10" height="25" fill="#0284C7" />
            <rect x="75" y="150" width="15" height="15" fill="#0F172A" />
            <rect x="100" y="155" width="25" height="10" fill="#0F172A" />
            <rect x="135" y="145" width="25" height="15" fill="#0F172A" />
          </svg>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "16px", fontWeight: 700, color: "var(--accent-blue)" }}>
              {code}
            </span>
            <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy Code">
              {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
            </Button>
          </div>
          {meta.name && (
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              {meta.name}
            </p>
          )}
          {meta.location && (
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              Location: {meta.location}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
