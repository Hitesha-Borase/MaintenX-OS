import React, { createContext, useContext, useState, useEffect } from "react";
import exceptionService from "../services/exceptionService";

const ExceptionContext = createContext();

export function ExceptionProvider({ children }) {
  const [exceptions, setExceptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with live backend exceptions on mount
  useEffect(() => {
    let isMounted = true;

    // Purge any stale mock storage
    localStorage.removeItem("flowstate_exceptions");

    async function loadBackendExceptions() {
      setIsLoading(true);
      try {
        const res = await exceptionService.getExceptions({ plantId: "PLT-01" });
        const list = res?.data || res;
        if (Array.isArray(list) && isMounted) {
          // Normalize fields from live PostgreSQL pm_exceptions
          const mapped = list.map((e) => ({
            id: e.id,
            title: e.title,
            severity: e.severity,
            category: e.category,
            stage: e.stage || (e.title?.toLowerCase().includes("pasteurizer") || e.title?.toLowerCase().includes("mixer") ? "PROCESSING" : "PACKAGING"),
            assetOrOrder: e.assetOrOrder || e.asset_or_order || "N/A",
            description: e.impactDescription || e.impact_description || "",
            impact: e.impactDescription || e.impact_description || "",
            owner: e.owner || "Unassigned",
            escalationLevel: e.escalationLevel || e.escalation_level || "Level 1 (Shift Supervisor)",
            status: e.status,
            resolutionNotes: e.resolutionNotes || e.resolution_notes || "",
            resolvedAt: e.resolvedAt || e.resolved_at || null,
            createdAt: e.createdAt || e.created_at || new Date().toISOString(),
            discoveredAt: e.createdAt ? new Date(e.createdAt).toISOString().replace("T", " ").substring(0, 16) : "Just now"
          }));
          setExceptions(mapped);
        } else if (isMounted) {
          setExceptions([]);
        }
      } catch (err) {
        console.warn("Could not load backend exceptions:", err.message);
        if (isMounted) setExceptions([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadBackendExceptions();
    return () => { isMounted = false; };
  }, []);

  const addException = async (exc) => {
    try {
      const res = await exceptionService.createException({
        title: exc.title,
        severity: exc.severity,
        category: exc.category,
        stage: exc.stage || "PACKAGING",
        assetOrOrder: exc.assetOrOrder,
        impactDescription: exc.impactDescription || exc.description || exc.title,
        owner: exc.owner || "Unassigned",
        escalationLevel: exc.escalationLevel || "Level 1 (Shift Supervisor)"
      });
      const created = res?.data || res;
      const nowIso = new Date().toISOString();
      const newExc = {
        id: created.id,
        title: created.title,
        severity: created.severity,
        category: created.category,
        stage: created.stage || exc.stage || "PACKAGING",
        assetOrOrder: created.assetOrOrder || exc.assetOrOrder || "N/A",
        description: created.impactDescription || exc.impactDescription || "",
        impact: created.impactDescription || exc.impactDescription || "",
        owner: created.owner || exc.owner || "Unassigned",
        escalationLevel: created.escalationLevel || exc.escalationLevel || "Level 1 (Shift Supervisor)",
        status: created.status === "Active" ? "Open" : created.status || "Open",
        resolutionNotes: "",
        resolvedAt: null,
        createdAt: created.createdAt || nowIso,
        discoveredAt: nowIso.replace("T", " ").substring(0, 16)
      };
      setExceptions((prev) => [newExc, ...prev]);
      return newExc;
    } catch (err) {
      console.error("Failed to create exception in database:", err.message);
      throw err;
    }
  };

  const updateExceptionStatus = async (excId, status, resolutionNotes = "") => {
    const nowResolved = status === "Resolved" ? new Date().toISOString() : null;
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === excId
          ? {
              ...e,
              status,
              resolutionNotes: resolutionNotes || e.resolutionNotes,
              resolvedAt: nowResolved || e.resolvedAt
            }
          : e
      )
    );

    try {
      if (status === "Resolved") {
        const res = await exceptionService.resolveException(excId, { resolutionNotes });
        if (res?.data?.resolvedAt) {
          setExceptions((prev) =>
            prev.map((e) =>
              e.id === excId ? { ...e, resolvedAt: res.data.resolvedAt } : e
            )
          );
        }
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
