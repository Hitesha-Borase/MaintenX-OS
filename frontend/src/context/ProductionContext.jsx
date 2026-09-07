import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_PRODUCTION_ORDERS, INITIAL_BATCHES } from "../data/mockProduction";

const ProductionContext = createContext();

export function ProductionProvider({ children }) {
  const [productionOrders, setProductionOrders] = useState(() => {
    const saved = localStorage.getItem("flowstate_production_orders");
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTION_ORDERS;
  });

  const [batches, setBatches] = useState(() => {
    const saved = localStorage.getItem("flowstate_batches");
    return saved ? JSON.parse(saved) : INITIAL_BATCHES;
  });

  const [shiftHandoffs, setShiftHandoffs] = useState([
    {
      id: "HO-2026-0831",
      shiftFrom: "Shift C (Night)",
      shiftTo: "Shift A (Day)",
      handedOverBy: "Carlos Mendez",
      receivedBy: "Elena Rostova",
      timestamp: "2026-08-31 05:55",
      notes: "Line 1 running at 580 BPM. Clean in Place (CIP) passed at 04:30. Filler head #7 seal replaced.",
      status: "Signed Off"
    }
  ]);

  useEffect(() => {
    localStorage.setItem("flowstate_production_orders", JSON.stringify(productionOrders));
  }, [productionOrders]);

  useEffect(() => {
    localStorage.setItem("flowstate_batches", JSON.stringify(batches));
  }, [batches]);

  const updateOrderStatus = (orderId, status) => {
    setProductionOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const advanceBatchStep = (batchId, nextStepName, progress) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? { ...b, currentStep: nextStepName, progressPercent: progress }
          : b
      )
    );
  };

  const addShiftHandoff = (handoff) => {
    const id = `HO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newH = {
      ...handoff,
      id,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "Signed Off"
    };
    setShiftHandoffs((prev) => [newH, ...prev]);
    return newH;
  };

  return (
    <ProductionContext.Provider
      value={{
        productionOrders,
        setProductionOrders,
        updateOrderStatus,
        batches,
        advanceBatchStep,
        shiftHandoffs,
        addShiftHandoff
      }}
    >
      {children}
    </ProductionContext.Provider>
  );
}

export const useProduction = () => useContext(ProductionContext);
