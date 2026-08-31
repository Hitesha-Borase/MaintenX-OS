import React, { createContext, useContext, useState, useEffect } from "react";

export const PLANTS = [
  { id: "plant-1", name: "Plant 1 - North Facility (Bottling & Processing)" },
  { id: "plant-2", name: "Plant 2 - South Facility (Canning & Logistics)" },
  { id: "all-plants", name: "All Global Facilities (Enterprise View)" }
];

export const DEPARTMENTS = [
  { id: "all-dept", name: "All Departments" },
  { id: "packaging", name: "Packaging & Bottling" },
  { id: "processing", name: "Processing & Formulation" },
  { id: "warehouse", name: "Warehouse & Logistics" },
  { id: "facilities", name: "Facilities & Utilities" },
  { id: "quality", name: "Quality Assurance (QA/QC)" }
];

export const SHIFTS = [
  { id: "shift-a", name: "Shift A (06:00 - 14:30) - Active", status: "Active" },
  { id: "shift-b", name: "Shift B (14:30 - 23:00)", status: "Upcoming" },
  { id: "shift-c", name: "Shift C (23:00 - 06:00)", status: "Scheduled" }
];

const AppContext = createContext();

export function AppProvider({ children }) {
  const [selectedPlant, setSelectedPlant] = useState(PLANTS[0]);
  const [selectedDepartment, setSelectedDepartment] = useState(DEPARTMENTS[0]);
  const [selectedShift, setSelectedShift] = useState(SHIFTS[0]);
  const [selectedDate, setSelectedDate] = useState("2026-08-31");
  
  // UI state overlays
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState(null); // { title: "Asset QR", code: "FM-001", type: "asset" }
  const [toasts, setToasts] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Keyboard shortcut for Global Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const addToast = (message, type = "success", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openQrModal = (title, code, meta = {}) => {
    setQrModalData({ title, code, meta });
  };

  const closeQrModal = () => {
    setQrModalData(null);
  };

  return (
    <AppContext.Provider
      value={{
        selectedPlant,
        setSelectedPlant,
        PLANTS,
        selectedDepartment,
        setSelectedDepartment,
        DEPARTMENTS,
        selectedShift,
        setSelectedShift,
        SHIFTS,
        selectedDate,
        setSelectedDate,
        isSearchOpen,
        setIsSearchOpen,
        isQuickActionOpen,
        setIsQuickActionOpen,
        qrModalData,
        openQrModal,
        closeQrModal,
        toasts,
        addToast,
        removeToast,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
