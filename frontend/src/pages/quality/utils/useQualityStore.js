import { useState, useEffect } from "react";

// Mock initial state
const initialState = {
  checks: [
    { id: "CHK-1001", batch: "BAT-2026-0891", type: "Hourly CCP", status: "Pending", time: "14:00" },
    { id: "CHK-1002", batch: "BAT-2026-0891", type: "Brix Test", status: "Pending", time: "15:00" }
  ],
  holds: [
    { id: "HLD-401", batch: "BAT-2026-0890", reason: "Temperature Deviation", status: "Active", date: "2026-09-02" }
  ],
  deviations: [
    { id: "DEV-802", holdId: "HLD-401", description: "Pasteurizer dropped below 83.1C", status: "Open" }
  ],
  investigations: [
    { id: "INV-901", devId: "DEV-802", finding: "", action: "", status: "Pending" }
  ],
  capas: [],
  releases: [
    { id: "REL-201", batch: "BAT-2026-0889", status: "Pending Review" }
  ]
};

// Global event name for syncing across components
const QUALITY_UPDATE_EVENT = "quality_store_updated";

function getStoredState() {
  const stored = localStorage.getItem("quality_mock_state");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return initialState;
    }
  }
  return initialState;
}

export function useQualityStore() {
  const [state, setState] = useState(getStoredState);

  useEffect(() => {
    const handleUpdate = () => setState(getStoredState());
    window.addEventListener(QUALITY_UPDATE_EVENT, handleUpdate);
    return () => window.removeEventListener(QUALITY_UPDATE_EVENT, handleUpdate);
  }, []);

  const updateState = (newState) => {
    localStorage.setItem("quality_mock_state", JSON.stringify(newState));
    window.dispatchEvent(new Event(QUALITY_UPDATE_EVENT));
  };

  // Actions
  const updateCheck = (id, newStatus) => {
    const next = { ...state, checks: state.checks.map(c => c.id === id ? { ...c, status: newStatus } : c) };
    updateState(next);
  };

  const createHold = (hold) => {
    const next = { ...state, holds: [...state.holds, hold] };
    updateState(next);
  };

  const updateHold = (id, newStatus) => {
    const next = { ...state, holds: state.holds.map(h => h.id === id ? { ...h, status: newStatus } : h) };
    updateState(next);
  };

  const createDeviation = (dev) => {
    const next = { ...state, deviations: [...state.deviations, dev] };
    updateState(next);
  };

  const updateDeviation = (id, newStatus) => {
    const next = { ...state, deviations: state.deviations.map(d => d.id === id ? { ...d, status: newStatus } : d) };
    updateState(next);
  };

  const createInvestigation = (inv) => {
    const next = { ...state, investigations: [...state.investigations, inv] };
    updateState(next);
  };

  const updateInvestigation = (id, updates) => {
    const next = { ...state, investigations: state.investigations.map(i => i.id === id ? { ...i, ...updates } : i) };
    updateState(next);
  };

  const updateRelease = (id, newStatus) => {
    const next = { ...state, releases: state.releases.map(r => r.id === id ? { ...r, status: newStatus } : r) };
    updateState(next);
  };

  return {
    ...state,
    updateState,
    updateCheck,
    createHold,
    updateHold,
    createDeviation,
    updateDeviation,
    createInvestigation,
    updateInvestigation,
    updateRelease
  };
}
