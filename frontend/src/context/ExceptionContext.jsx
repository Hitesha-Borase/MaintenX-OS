import React, { createContext, useContext, useState, useEffect } from "react";
import exceptionService from "../services/exceptionService";
import { INITIAL_EXCEPTIONS } from "../data/mockExceptions";

const ExceptionContext = createContext();

export function ExceptionProvider({ children }) {
  const [exceptions, setExceptions] = useState(() => {
    const saved = localStorage.getItem("flowstate_exceptions");
    return saved ? JSON.parse(saved) : INITIAL_EXCEPTIONS;
  });

  // Sync with live backend exceptions on mount
  useEffect(() => {
    let isMounted = true;
    async function loadBackendExceptions() {
      try {
        const res = await exceptionService.getExceptions();
        if (res?.data && Array.isArray(res.data) && isMounted && res.data.length > 0) {
          // Normalize fields for UI compatibility
          const mapped = res.data.map(e => ({
            id: e.id,
            title: e.title,
            severity: e.severity,
            category: e.category,
            assetOrOrder: e.assetOrOrder,
            description: e.impactDescription,
            impact: e.impactDescription,
            owner: e.owner,
            escalationLevel: e.escalationLevel,
            status: e.status === "Active" ? "Open" : e.status,
            resolutionNotes: e.resolutionNotes,
            discoveredAt: e.createdAt ? new Date(e.createdAt).toISOString().replace("T", " ").substring(0, 16) : "Just now",
            timeOpenMinutes: 12
          }));
          setExceptions(mapped);
          localStorage.setItem("flowstate_exceptions", JSON.stringify(mapped));
        }
      } catch (err) {
        console.warn("Using local exceptions cache:", err.message);
      }
    }
    loadBackendExceptions();
    return () => { isMounted = false; };
  }, []);

  const addException = async (exc) => {
    const tempId = `EXC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newExc = {
      ...exc,
      id: tempId,
      discoveredAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      timeOpenMinutes: 1,
      status: "Open"
    };
    setExceptions((prev) => [newExc, ...prev]);

    try {
      const res = await exceptionService.createException({
        title: exc.title,
        severity: exc.severity,
        category: exc.category,
        assetOrOrder: exc.assetOrOrder,
        impactDescription: exc.impactDescription || exc.description || exc.title,
        owner: exc.owner,
        escalationLevel: exc.escalationLevel
      });
      if (res?.data?.id) {
        newExc.id = res.data.id;
        setExceptions((prev) => prev.map(e => e.id === tempId ? { ...newExc, id: res.data.id } : e));
      }
    } catch (err) {
      console.warn("Created locally, background sync failed:", err.message);
    }
    return newExc;
  };

  const updateExceptionStatus = async (excId, status, resolutionNotes = "") => {
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === excId
          ? {
              ...e,
              status,
              resolutionNotes: resolutionNotes || e.resolutionNotes
            }
          : e
      )
    );

    try {
      if (status === "Resolved") {
        await exceptionService.resolveException(excId, { resolutionNotes });
      }
    } catch (err) {
      console.warn("Failed to sync resolution to backend:", err.message);
    }
  };

  const assignException = async (excId, owner, escalationLevel) => {
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === excId
          ? {
              ...e,
              owner,
              escalationLevel: escalationLevel || e.escalationLevel,
              status: "Active - In Repair"
            }
          : e
      )
    );

    try {
      await exceptionService.assignException(excId, { owner, escalationLevel });
    } catch (err) {
      console.warn("Failed to sync assignment to backend:", err.message);
    }
  };

  return (
    <ExceptionContext.Provider
      value={{
        exceptions,
        setExceptions,
        addException,
        updateExceptionStatus,
        assignException
      }}
    >
      {children}
    </ExceptionContext.Provider>
  );
}

export const useExceptions = () => useContext(ExceptionContext);
export const useException = () => useContext(ExceptionContext);
