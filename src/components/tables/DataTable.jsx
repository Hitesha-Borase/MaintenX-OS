import React, { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Download, Filter } from "lucide-react";
import { Button } from "../common/Button";
import { useApp } from "../../context/AppContext";

export function DataTable({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = "Search records...",
  filterKey = null,
  filterOptions = [],
  pageSize = 8,
  onRowClick = null,
  exportFilename = "flowstate_export.csv",
  title = "",
  actions = null
}) {
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Filter key match
      if (filterKey && selectedFilter !== "ALL") {
        if (item[filterKey] !== selectedFilter) return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return columns.some((col) => {
          const val = item[col.accessor];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        });
      }

      return true;
    });
  }, [data, columns, searchQuery, filterKey, selectedFilter]);

  // Sort Logic
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      if (strA < strB) return sortConfig.direction === "asc" ? -1 : 1;
      if (strA > strB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (accessor) => {
    setSortConfig((prev) => {
      if (prev.key === accessor) {
        return { key: accessor, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key: accessor, direction: "asc" };
    });
  };

  const handleExportCSV = () => {
    if (!sortedData.length) {
      addToast("No data to export", "warning");
      return;
    }

    const headers = columns.map((c) => c.header).join(",");
    const rows = sortedData.map((item) =>
      columns
        .map((c) => {
          const val = item[c.accessor];
          if (val === null || val === undefined) return '""';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Exported ${sortedData.length} records to ${exportFilename}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
      {/* Table Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "260px" }}>
          {title && <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{title}</h3>}
          {searchable && (
            <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)"
                }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: "32px", fontSize: "12px", height: "34px" }}
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {filterKey && filterOptions.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Filter size={14} color="var(--text-muted)" />
              <select
                className="form-select"
                style={{ height: "34px", padding: "4px 10px", fontSize: "12px", width: "auto" }}
                value={selectedFilter}
                onChange={(e) => {
                  setSelectedFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">All {filterKey}</option>
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>

          {actions}
        </div>
      </div>

      {/* Data Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  onClick={() => col.sortable !== false && handleSort(col.accessor)}
                  style={{ cursor: col.sortable !== false ? "pointer" : "default", ...col.headerStyle }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <ArrowUpDown
                        size={12}
                        color={sortConfig.key === col.accessor ? "var(--accent-blue)" : "var(--text-muted)"}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {columns.map((col) => (
                    <td key={col.accessor} style={col.cellStyle}>
                      {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)" }}>
                  No records matching your search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)" }}>
        <span>
          Showing {(currentPage - 1) * pageSize + (paginatedData.length ? 1 : 0)} - {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={14} />
          </Button>

          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, padding: "0 6px" }}>
            {currentPage} / {totalPages}
          </span>

          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
