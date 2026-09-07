// Traceability / Batch 360° Data
export const TRACEABILITY_RECORDS = {
  "BAT-2026-0892": {
    batchId: "BAT-2026-0892",
    productName: "Organic Cold-Pressed Orange Juice 500ml",
    sku: "SKU-AJ-500ML-ORG",
    plant: "Plant 1 - North Facility",
    line: "Line 1 (Aseptic Bottling)",
    status: "Executing / QA Preliminary Pass",
    productionDate: "2026-08-31",
    totalUnits: 24000,
    traceabilityGraph: {
      forwardTree: [
        {
          stage: "1. Upstream Suppliers & Raw Lots",
          nodes: [
            { id: "SUP-01", label: "Citrus Valley Farms Co.", type: "Supplier", lot: "CVF-2026-VAL-99", material: "Organic Valencia Orange Conc." },
            { id: "SUP-02", label: "Amcor Rigid Packaging", type: "Supplier", lot: "AMC-PET500-771", material: "500ml PET Bottles" },
            { id: "SUP-03", label: "Closure Systems Intl", type: "Supplier", lot: "CSI-CAP-38-04", material: "38mm Aseptic Caps" }
          ]
        },
        {
          stage: "2. Receiving & Quarantine Release",
          nodes: [
            { id: "REC-01", label: "GRN-2026-0881 (Passed HPLC Purity)", type: "Inspection", date: "2026-08-20", inspector: "Sarah Jenkins" },
            { id: "REC-02", label: "GRN-2026-0889 (Passed Dimensional Spec)", type: "Inspection", date: "2026-08-25", inspector: "David Kim" }
          ]
        },
        {
          stage: "3. Formulation, Blending & Pasteurization",
          nodes: [
            { id: "PROC-01", label: "Tank TK-02 Blend Cycle #401", type: "Process", param: "Brix: 11.9, Temp: 90.2°C", operator: "Vikram Patel" },
            { id: "PROC-02", label: "Pasteurizer HTST-300 (Continuous Hold)", type: "Equipment", time: "15.2 sec @ 90.5°C", status: "CCP PASS" }
          ]
        },
        {
          stage: "4. Aseptic Filling & Capping (Line 1)",
          nodes: [
            { id: "EQUIP-01", label: "Filler FM-001 (Fill Heads 1-12)", type: "Equipment", speed: "580 BPM", o2Level: "0.8% O2" },
            { id: "EQUIP-02", label: "Capper CP-102 (Magnetic Chuck Torque)", type: "Equipment", torque: "2.85 Nm", status: "PASS" }
          ]
        },
        {
          stage: "5. Packaging, Palletizing & QA Lot Release",
          nodes: [
            { id: "QA-01", label: "QA Release Certificate #CoA-904-A", type: "QA Release", result: "100% Micro Negative", signedBy: "Elena Rostova" },
            { id: "PLT-01", label: "Pallets PLT-904-01 through PLT-904-12", type: "Pallet", count: "12 Pallets (24,000 btls)", location: "Bay D" }
          ]
        },
        {
          stage: "6. Customer Shipments & OTIF Distribution",
          nodes: [
            { id: "CUST-01", label: "Whole Foods Market DC #04 (Atlanta)", type: "Customer", orderNo: "CO-WF-99410", shipDate: "2026-09-01", qty: "16,000 btls" },
            { id: "CUST-02", label: "Target Regional Hub #12 (Charlotte)", type: "Customer", orderNo: "CO-TG-88102", shipDate: "2026-09-01", qty: "8,000 btls" }
          ]
        }
      ]
    }
  },
  "BAT-2026-0885": {
    batchId: "BAT-2026-0885",
    productName: "Sparkling Yuzu Sparkling Tea 330ml Can",
    sku: "SKU-CAN-330ML-LEM",
    plant: "Plant 2 - South Facility",
    line: "Line 3 (Canning Line)",
    status: "Completed & Released",
    productionDate: "2026-08-30",
    totalUnits: 36000,
    traceabilityGraph: {
      forwardTree: [
        {
          stage: "1. Upstream Suppliers & Raw Lots",
          nodes: [
            { id: "SUP-10", label: "Nippon Botanical Extracts", type: "Supplier", lot: "NBE-YZ-440", material: "Yuzu Extract Liquid" },
            { id: "SUP-11", label: "Ball Corporation", type: "Supplier", lot: "BAL-CAN-330-9", material: "330ml Aluminum Cans" }
          ]
        },
        {
          stage: "2. Canning & Double Seam Sealing",
          nodes: [
            { id: "CAN-01", label: "Canning Monobloc Line 3", type: "Equipment", speed: "750 CPM", seamOverlap: "68%" }
          ]
        },
        {
          stage: "3. QA Release & Outbound Distribution",
          nodes: [
            { id: "QA-10", label: "CoA-CAN-885 Passed", type: "QA Release", signedBy: "Elena Rostova" },
            { id: "CUST-10", label: "Kroger Distribution Center #09", type: "Customer", orderNo: "CO-KR-7741", qty: "36,000 cans" }
          ]
        }
      ]
    }
  }
};
