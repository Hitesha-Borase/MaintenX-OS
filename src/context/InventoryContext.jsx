import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_INVENTORY_LOTS, WAREHOUSE_ZONES } from "../data/mockInventory";

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [lots, setLots] = useState(() => {
    const saved = localStorage.getItem("flowstate_inventory_lots");
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY_LOTS;
  });

  const [zones, setZones] = useState(WAREHOUSE_ZONES);

  useEffect(() => {
    localStorage.setItem("flowstate_inventory_lots", JSON.stringify(lots));
  }, [lots]);

  const addLot = (newLot) => {
    const lotNumber = newLot.lotNumber || `LOT-REC-${Math.floor(1000 + Math.random() * 9000)}`;
    const lotWithMeta = {
      ...newLot,
      lotNumber,
      receivedDate: new Date().toISOString().substring(0, 10),
      qaStatus: newLot.qaStatus || "Quarantine"
    };
    setLots((prev) => [lotWithMeta, ...prev]);
    return lotWithMeta;
  };

  const transferLotLocation = (lotNumber, newLocation) => {
    setLots((prev) =>
      prev.map((lot) =>
        lot.lotNumber === lotNumber ? { ...lot, location: newLocation } : lot
      )
    );
  };

  return (
    <InventoryContext.Provider
      value={{
        lots,
        setLots,
        zones,
        addLot,
        transferLotLocation
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => useContext(InventoryContext);
