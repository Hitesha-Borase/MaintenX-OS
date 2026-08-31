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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Cleaning & Verification Sign-Off
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Verify and authorize chemical clean validation swabs
        </p>
      </div>

      <form onSubmit={handleVerify}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
            Clean Verification Sign-Off
          </h3>

          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Confirm that ATP swab levels are below target limits (limit: &lt;10 RLU).
          </div>

          <Button type="submit" variant="primary" icon={FileCheck} disabled={verified}>
            {verified ? "Verification Signed" : "Sign Off Verification"}
          </Button>
        </Card>
      </form>
    </div>
  );
}
