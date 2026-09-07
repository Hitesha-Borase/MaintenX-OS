import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_EXCEPTIONS } from "../data/mockExceptions";

const ExceptionContext = createContext();

export function ExceptionProvider({ children }) {
  const [exceptions, setExceptions] = useState(() => {
    const saved = localStorage.getItem("flowstate_exceptions");
    return saved ? JSON.parse(saved) : INITIAL_EXCEPTIONS;
  });

  useEffect(() => {
    localStorage.setItem("flowstate_exceptions", JSON.stringify(exceptions));
  }, [exceptions]);

  const addException = (exc) => {
    const id = `EXC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newExc = {
      ...exc,
      id,
      discoveredAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      timeOpenMinutes: 1,
      status: "Open"
    };
    setExceptions((prev) => [newExc, ...prev]);
    return newExc;
  };

  const updateExceptionStatus = (excId, status, resolutionNotes = "") => {
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
  };

  const assignException = (excId, owner, escalationLevel) => {
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
