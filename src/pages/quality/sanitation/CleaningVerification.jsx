import React, { useState } from "react";
import { FileCheck, Save } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function CleaningVerification() {
  const { addToast } = useApp();

  const [verified, setVerified] = useState(false);

  const handleVerify = (e) => {
    e.preventDefault();

    setVerified(true);
    addToast("CIP cleanup verification signed off by Quality QA.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Cleaning & Verification Sign-Off
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Verify and authorize chemical clean validation swabs
        </p>
      </div>

      <form onSubmit={handleVerify}>
        <Card 
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "20px",
            padding: "24px",
            borderRadius: "16px"
          }}
        >
          <div style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
            Confirm that ATP swab levels are below target limits (limit: &lt;10 RLU).
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <Button 
              type="submit" 
              variant="primary" 
              icon={FileCheck} 
              disabled={verified}
              size="lg"
            >
              {verified ? "Verification Signed" : "Sign Off Verification"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
