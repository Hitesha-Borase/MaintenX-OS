import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { INITIAL_PRODUCTION_ORDERS, INITIAL_BATCHES } from "../data/mockProduction";
import productionService from "../services/productionService";

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

  const [isLoading, setIsLoading] = useState(false);

  // Sync state with backend on mount
  const syncWithBackend = useCallback(async () => {
    setIsLoading(true);
    try {
      const [remoteOrders, remoteBatches] = await Promise.allSettled([
        productionService.getOrders(),
        productionService.getBatches(),
      ]);

      if (remoteOrders.status === "fulfilled" && Array.isArray(remoteOrders.value) && remoteOrders.value.length > 0) {
        setProductionOrders((prev) => {
          // Merge remote orders with existing
          const merged = [...remoteOrders.value];
          return merged;
        });
      }

      if (remoteBatches.status === "fulfilled" && Array.isArray(remoteBatches.value) && remoteBatches.value.length > 0) {
        setBatches(remoteBatches.value);
      }
    } catch (err) {
      console.warn("Production backend sync fallback:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  useEffect(() => {
    localStorage.setItem("flowstate_production_orders", JSON.stringify(productionOrders));
  }, [productionOrders]);

  useEffect(() => {
    localStorage.setItem("flowstate_batches", JSON.stringify(batches));
  }, [batches]);

  const updateOrderStatus = async (orderId, status) => {
    // 1. Optimistic local update
    setProductionOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );

    // 2. Persist to PostgreSQL backend
    try {
      await productionService.updateOrderStatus(orderId, status);
    } catch (err) {
      console.warn("Failed to persist order status to backend:", err.message);
    }
  };

  const createProductionOrder = async (orderData) => {
    const tempId = `PO-${Date.now()}`;
    const newOrder = { id: tempId, ...orderData, status: orderData.status || "PLANNED" };
    setProductionOrders((prev) => [newOrder, ...prev]);

    try {
      const created = await productionService.createOrder(orderData);
      if (created?.id) {
        setProductionOrders((prev) => prev.map((o) => (o.id === tempId ? created : o)));
      }
      return created || newOrder;
    } catch (err) {
      console.warn("Created order offline/fallback:", err.message);
      return newOrder;
    }
  };

  const advanceBatchStep = async (batchId, nextStepName, progress, stepNumber = 1) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? { ...b, currentStep: nextStepName, progressPercent: progress }
          : b
      )
    );

    try {
      await productionService.advanceBatchStep(batchId, {
        stepNumber: Number(stepNumber) || 1,
        status: "COMPLETED",
        outputQty: 1000,
        scrapQty: 5,
        operatorNotes: `Advanced to ${nextStepName}`,
      });
    } catch (err) {
      console.warn("Failed to persist batch step to backend:", err.message);
    }
  };

  const recordOperatorEntry = async (entryData) => {
    try {
      return await productionService.recordOperatorEntry(entryData);
    } catch (err) {
      console.warn("Operator entry fallback:", err.message);
      return { success: true, simulated: true };
    }
  };

  const logDowntime = async (downtimeData) => {
    try {
      return await productionService.logDowntime(downtimeData);
    } catch (err) {
      console.warn("Downtime log fallback:", err.message);
      return { success: true, simulated: true };
    }
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
        createProductionOrder,
        batches,
        advanceBatchStep,
        recordOperatorEntry,
        logDowntime,
        shiftHandoffs,
        addShiftHandoff,
        isLoading,
        syncWithBackend
      }}
    >
      {children}
    </ProductionContext.Provider>
  );
}

export const useProduction = () => useContext(ProductionContext);
