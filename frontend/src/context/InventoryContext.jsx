import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { INITIAL_INVENTORY_LOTS, WAREHOUSE_ZONES } from "../data/mockInventory";
import warehouseService from "../services/warehouseService";

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [lots, setLots] = useState(() => {
    const saved = localStorage.getItem("flowstate_inventory_lots");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasStaged = parsed.some(l => l.status === "STAGED");
        if (hasStaged) return parsed;
        const stagedFromInitial = INITIAL_INVENTORY_LOTS.filter(l => l.status === "STAGED");
        return [...stagedFromInitial, ...parsed];
      } catch (e) {
        return INITIAL_INVENTORY_LOTS;
      }
    }
    return INITIAL_INVENTORY_LOTS;
  });

  const [zones, setZones] = useState(WAREHOUSE_ZONES);
  
  const [shipments, setShipments] = useState([
    { id: "SHP-001", item: "Glass Bottles 1L", volume: "20,000 Pcs", status: "TRANSIT", supplier: "GlassCorp", expected: "2026-09-02" },
    { id: "SHP-002", item: "Liquid Cane Sugar 500L", volume: "2 Drums", status: "ARRIVED", supplier: "Sugar Valley", expected: "2026-09-02" }
  ]);
  
  const [pickLists, setPickLists] = useState([
    { id: "PL-101", order: "ORD-991", status: "PENDING", items: 2 },
    { id: "PL-102", order: "ORD-992", status: "IN_PROGRESS", items: 5 }
  ]);

  const [putAwayHistory, setPutAwayHistory] = useState([
    {
      lotNumber: "LOT-RM-GNG-0092",
      materialName: "Organic Ginger Root Extract Fluid 20:1",
      quantity: 120,
      unit: "kg",
      fromLocation: "Dock 02 - Receiving Staging",
      toLocation: "Ambient Storage Bay 2 - Bin G-12",
      timestamp: "2026-09-03 07:30 AM",
      operator: "Alexander Vance"
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  // Sync state with Fastify warehouse backend on mount
  const syncWithBackend = useCallback(async () => {
    setIsLoading(true);
    try {
      const [remoteLots, remoteTx] = await Promise.allSettled([
        warehouseService.getLots(),
        warehouseService.getTransactions(),
      ]);

      const lotsList = Array.isArray(remoteLots.value) ? remoteLots.value : (Array.isArray(remoteLots.value?.data) ? remoteLots.value.data : null);
      if (remoteLots.status === "fulfilled" && lotsList && lotsList.length > 0) {
        setLots(lotsList);
      }
      const txList = Array.isArray(remoteTx.value) ? remoteTx.value : (Array.isArray(remoteTx.value?.data) ? remoteTx.value.data : null);
      if (remoteTx.status === "fulfilled" && txList && txList.length > 0) {
        setPutAwayHistory((prev) => [...txList, ...prev]);
      }
    } catch (err) {
      console.warn("Warehouse backend sync fallback:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  useEffect(() => {
    localStorage.setItem("flowstate_inventory_lots", JSON.stringify(lots));
  }, [lots]);

  const addLot = async (newLot) => {
    const lotNumber = newLot.lotNumber || `LOT-REC-${Math.floor(1000 + Math.random() * 9000)}`;
    const lotWithMeta = {
      ...newLot,
      lotNumber,
      receivedDate: new Date().toISOString().substring(0, 10),
      qaStatus: newLot.qaStatus || "Quarantine",
      status: "STAGED"
    };
    setLots((prev) => [lotWithMeta, ...prev]);

    // Persist to PostgreSQL backend
    try {
      await warehouseService.recordStockMovement({
        lotId: newLot.lotId || newLot.id || lotNumber,
        type: "RECEIPT",
        transactionType: "RECEIPT",
        quantity: Number(newLot.quantity) || 1000,
        uom: newLot.unit || "kg",
        fromLocation: "INBOUND_RECEIVING",
        toLocation: newLot.location || "STAGE-01",
        referenceNumber: lotNumber,
        notes: "Goods Receipt & LPN Ingestion",
      });
    } catch (err) {
      console.warn("Recorded lot offline:", err.message);
    }

    return lotWithMeta;
  };

  const transferLotLocation = async (lotNumber, newLocation) => {
    const targetLot = lots.find(l => l.lotNumber === lotNumber);
    if (targetLot) {
      setPutAwayHistory((prev) => [
        {
          lotNumber: targetLot.lotNumber,
          materialName: targetLot.materialName,
          quantity: targetLot.quantity,
          unit: targetLot.unit,
          fromLocation: targetLot.location,
          toLocation: newLocation,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          operator: "Alexander Vance"
        },
        ...prev
      ]);

      // Update zone capacity dynamically
      setZones((prev) =>
        prev.map((z) => {
          if (newLocation.toLowerCase().includes("cold") && z.id === "ZONE-COLD-A") {
            return { ...z, occupied: Math.min(z.capacity, z.occupied + (targetLot.palletsCount || 1)) };
          } else if (newLocation.toLowerCase().includes("ambient") && z.id === "ZONE-AMB-B") {
            return { ...z, occupied: Math.min(z.capacity, z.occupied + (targetLot.palletsCount || 1)) };
          } else if (newLocation.toLowerCase().includes("packaging") && z.id === "ZONE-PKG-C") {
            return { ...z, occupied: Math.min(z.capacity, z.occupied + (targetLot.palletsCount || 1)) };
          }
          return z;
        })
      );

      // Persist transfer to PostgreSQL backend
      try {
        await warehouseService.recordStockMovement({
          lotId: targetLot.id || "00000000-0000-0000-0000-000000000001",
          transactionType: "TRANSFER",
          quantity: Number(targetLot.quantity) || 100,
          uom: targetLot.unit || "kg",
          fromLocation: targetLot.location || "STAGING",
          toLocation: newLocation,
          referenceNumber: `TRF-${Date.now()}`,
          notes: "Putaway transfer execution",
        });
      } catch (err) {
        console.warn("Transferred lot offline:", err.message);
      }
    }

    setLots((prev) =>
      prev.map((lot) =>
        lot.lotNumber === lotNumber ? { ...lot, location: newLocation, status: "PUT-AWAY" } : lot
      )
    );
  };
  
  const receiveShipment = (id) => {
    setShipments(prev => prev.map(s => s.id === id ? { ...s, status: "RECEIVED" } : s));
  };
  
  const startPickList = (id) => {
    setPickLists(prev => prev.map(p => p.id === id ? { ...p, status: "IN_PROGRESS" } : p));
  };
  
  const completePickList = (id) => {
    setPickLists(prev => prev.map(p => p.id === id ? { ...p, status: "STAGED_FOR_ISSUE" } : p));
  };

  return (
    <InventoryContext.Provider
      value={{
        lots,
        setLots,
        zones,
        shipments,
        receiveShipment,
        pickLists,
        startPickList,
        completePickList,
        addLot,
        transferLotLocation,
        putAwayHistory,
        isLoading,
        syncWithBackend
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => useContext(InventoryContext);
