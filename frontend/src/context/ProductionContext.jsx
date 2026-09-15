import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import productionService from "../services/productionService";

const ProductionContext = createContext();

export function ProductionProvider({ children }) {
  const [productionOrders, setProductionOrders] = useState([]);
  const [batches, setBatches] = useState([]);
  const [shiftHandoffs, setShiftHandoffs] = useState([]);
  const [machines, setMachines] = useState([]);
  const [downtimeEvents, setDowntimeEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state with backend on mount
  const syncWithBackend = useCallback(async () => {
    setIsLoading(true);
    try {
      const [remoteOrders, remoteBatches, remoteMachines, remoteDowntime, remoteHandoffs] = await Promise.allSettled([
        productionService.getOrders(),
        productionService.getBatches(),
        productionService.getMachines(),
        productionService.getDowntime(),
        productionService.getShiftHandoffs(),
      ]);

      const extract = (res) => {
        if (res.status !== "fulfilled") return null;
        const val = res.value;
        if (Array.isArray(val)) return val;
        if (Array.isArray(val?.data)) return val.data;
        if (Array.isArray(val?.data?.data)) return val.data.data;
        return null;
      };

      const ordersList = extract(remoteOrders);
      if (ordersList !== null) setProductionOrders(ordersList);

      const batchesList = extract(remoteBatches);
      if (batchesList !== null) setBatches(batchesList);

      const machinesList = extract(remoteMachines);
      if (machinesList !== null) setMachines(machinesList);

      const downtimeList = extract(remoteDowntime);
      if (downtimeList !== null) setDowntimeEvents(downtimeList);

      const handoffsList = extract(remoteHandoffs);
      if (handoffsList !== null) setShiftHandoffs(handoffsList);
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
    const handleTenantChanged = () => {
      setProductionOrders([]);
      setBatches([]);
      setShiftHandoffs([]);
      localStorage.removeItem("flowstate_production_orders");
      localStorage.removeItem("flowstate_batches");
    };
    window.addEventListener("maintenx:tenant_changed", handleTenantChanged);
    return () => window.removeEventListener("maintenx:tenant_changed", handleTenantChanged);
  }, []);

  useEffect(() => {
    localStorage.setItem("flowstate_production_orders", JSON.stringify(productionOrders));
  }, [productionOrders]);

  useEffect(() => {
    localStorage.setItem("flowstate_batches", JSON.stringify(batches));
  }, [batches]);

  const updateOrderStatus = async (orderId, status) => {
    // 1. Optimistic local update
    setProductionOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId || o.orderNumber === orderId) {
          const tgt = Number(o.targetQuantity ?? o.targetQty ?? 0);
          let prod = Number(o.producedQuantity ?? o.producedQty ?? 0);
          const st = String(status || "").toLowerCase();
          if (st.includes("comp") || st.includes("qa")) {
            if (tgt > 0) prod = tgt;
          } else if (st.includes("run") && prod === 0 && tgt > 0) {
            prod = Math.round(tgt * 0.45);
          }
          return { ...o, status, producedQuantity: prod };
        }
        return o;
      })
    );

    // 2. Persist to PostgreSQL backend
    try {
      await productionService.updateOrderStatus(orderId, status);
    } catch (err) {
      console.warn("Failed to persist order status to backend:", err.message);
    }
  };

  const deleteProductionOrder = async (orderId) => {
    setProductionOrders((prev) =>
      prev.filter((o) => o.id !== orderId && o.orderNumber !== orderId)
    );
    try {
      await productionService.deleteOrder(orderId);
    } catch (err) {
      console.warn("Failed to delete order from backend:", err.message);
    }
  };

  const updateOrderQuantity = async (orderId, producedQuantity, scrapQuantity = 0) => {
    setProductionOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, producedQuantity: Number(producedQuantity) || 0, scrapQuantity: Number(scrapQuantity) || 0 } : o))
    );
    try {
      await productionService.recordOperatorEntry({
        orderId,
        goodUnitsIncrement: Number(producedQuantity) || 0,
        scrapUnitsIncrement: Number(scrapQuantity) || 0
      });
    } catch (err) {
      console.warn("Failed to persist order quantity to backend:", err.message);
    }
  };

  const createProductionOrder = async (orderData) => {
    const tempId = `PO-${Date.now()}`;
    const newOrder = { id: tempId, ...orderData, status: orderData.status || "PLANNED" };
    setProductionOrders((prev) => [newOrder, ...prev]);

    try {
      const created = await productionService.createOrder(orderData);
      const actualOrder = created?.order || created;
      
      // Pull fresh orders from backend so state is 100% in sync with database
      try {
        const remote = await productionService.getOrders();
        const list = Array.isArray(remote) ? remote : (Array.isArray(remote?.data) ? remote.data : (Array.isArray(remote?.data?.data) ? remote.data.data : null));
        if (Array.isArray(list) && list.length > 0) {
          setProductionOrders(list);
          return actualOrder || newOrder;
        }
      } catch (syncErr) {
        console.warn("Backend orders resync failed:", syncErr.message);
      }

      if (actualOrder?.id) {
        setProductionOrders((prev) =>
          prev.map((o) =>
            o.id === tempId
              ? { ...newOrder, ...actualOrder, id: actualOrder.id, orderNumber: actualOrder.orderNumber || newOrder.orderNumber }
              : o
          )
        );
      }
      return actualOrder || newOrder;
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

  const updateMachineStatus = async (machineId, newStatus) => {
    setMachines((prev) =>
      prev.map((m) => (m.id === machineId || m.machineCode === machineId ? { ...m, status: newStatus } : m))
    );
    try {
      await productionService.updateMachineStatus(machineId, newStatus);
    } catch (err) {
      console.warn("Machine status update fallback:", err.message);
    }
  };

  const addShiftHandoff = async (handoff) => {
    const id = `HO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newH = {
      ...handoff,
      id,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "Signed Off"
    };
    setShiftHandoffs((prev) => [newH, ...prev]);

    try {
      const res = await productionService.createShiftHandoff(handoff);
      const saved = res?.data?.data || res?.data || res;
      if (saved?.id) {
        setShiftHandoffs((prev) => prev.map((h) => (h.id === id ? { ...newH, ...saved } : h)));
      }
    } catch (err) {
      console.warn("Shift handoff creation fallback:", err.message);
    }
    return newH;
  };

  return (
    <ProductionContext.Provider
      value={{
        productionOrders,
        setProductionOrders,
        updateOrderStatus,
        deleteProductionOrder,
        updateOrderQuantity,
        createProductionOrder,
        batches,
        advanceBatchStep,
        recordOperatorEntry,
        logDowntime,
        shiftHandoffs,
        addShiftHandoff,
        machines,
        setMachines,
        updateMachineStatus,
        downtimeEvents,
        setDowntimeEvents,
        isLoading,
        syncWithBackend
      }}
    >
      {children}
    </ProductionContext.Provider>
  );
}

export const useProduction = () => useContext(ProductionContext);
