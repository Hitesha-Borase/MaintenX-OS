import { useState, useEffect } from "react";

// Initial state (always empty — data comes from live DB via quality service)
const initialState = {
  checks: [],
  holds: [],
  deviations: [],
  investigations: [],
  capas: [],
  releases: []
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
