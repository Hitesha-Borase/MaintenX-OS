import React, { useState } from "react";
import {
  Building2,
  Users,
  Plus,
  CheckCircle2,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function DepartmentsPage() {
  const { addToast } = useApp();

  const [departments, setDepartments] = useState([
    { id: "DEP-01", name: "Operations / Shop Floor", code: "OPS", head: "Robert Thorne", membersCount: 48, status: "Active" },
    { id: "DEP-02", name: "Maintenance & Reliability", code: "MAINT", head: "Marcus Vance", membersCount: 14, status: "Active" },
    { id: "DEP-03", name: "Quality Assurance & Lab", code: "QA", head: "Sarah Jenkins", membersCount: 12, status: "Active" },
    { id: "DEP-04", name: "Warehouse & Logistics", code: "WHSE", head: "Elena Rostova", membersCount: 16, status: "Active" },
    { id: "DEP-05", name: "IT & Digital Automation", code: "IT", head: "Alexander Vance", membersCount: 6, status: "Active" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Enterprise Department Hierarchy
            </h1>
            <Badge variant="cyan">{departments.length} Departments</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Organizational unit structures, department heads, and operational cost center mappings.
          </p>
        </div>
      </div>

      {/* Departments Table */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Dept Code</th>
                <th>Department Name</th>
                <th>Department Lead</th>
                <th>Staff Headcount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{d.code}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{d.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>{d.head}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{d.membersCount} Members</span>
                  </td>
                  <td>
                    <Badge variant="emerald">{d.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
