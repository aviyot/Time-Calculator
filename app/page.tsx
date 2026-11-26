"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import {
  calculateTotalSeconds,
  formatTime,
  getFriendlyTimeDesc,
} from "../lib/time";
import type { TimeColumns, TimeField, TimeValues } from "../lib/time";

type TimeRow = TimeValues & { id: number };
type DurationField = Exclude<TimeField, "multiplier">;
type ActiveMenu =
  | { type: "row"; rowId: number; anchorRect: DOMRect }
  | { type: "global"; anchorRect: DOMRect }
  | null;

const timeFields: { key: DurationField; label: string; placeholder: string }[] = [
  { key: "hour", label: "Hours", placeholder: "hh" },
  { key: "minute", label: "Minutes", placeholder: "mm" },
  { key: "second", label: "Seconds", placeholder: "ss" },
];

function createRow(id: number): TimeRow {
  return { id, hour: "", minute: "", second: "", multiplier: "1" };
}

function getMultiplierBadge(multiplier: string): string | null {
  const value = +multiplier;
  if (!Number.isNaN(value) && value > 0 && value !== 1) {
    return `×${value}`;
  }
  return null;
}

function DotsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.24 9m4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

export default function Home() {
  const [rows, setRows] = useState<TimeRow[]>(() => [createRow(0), createRow(1)]);
  const [columns, setColumns] = useState<TimeColumns>({
    hour: true,
    minute: true,
    second: true,
    multiplier: true,
  });
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);
  const nextRowId = useRef(2);
  const pendingFocusRow = useRef<number | null>(0);
  const timesRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const gridTemplate = [
    columns.hour && "1fr",
    columns.minute && "1fr",
    columns.second && "1fr",
    "auto",
  ]
    .filter(Boolean)
    .join(" ");

  const gridStyle: CSSProperties & { "--grid-template": string } = {
    "--grid-template": gridTemplate,
  };

  const timesClassName = [
    "times-container",
    !columns.hour && "hide-hours",
    !columns.minute && "hide-minutes",
    !columns.second && "hide-seconds",
  ]
    .filter(Boolean)
    .join(" ");

  const totalSeconds = calculateTotalSeconds(rows, columns);

  const activeRow =
    activeMenu?.type === "row"
      ? rows.find((row) => row.id === activeMenu.rowId) ?? null
      : null;

  useEffect(() => {
    if (pendingFocusRow.current === null) return;

    const row = timesRef.current?.querySelector(
      `[data-row-id="${pendingFocusRow.current}"]`,
    );
    row?.querySelector<HTMLInputElement>("input.time:not(:disabled)")?.focus();
    pendingFocusRow.current = null;
  }, [rows]);

  useEffect(() => {
    if (!activeMenu) return;

    function handleClose() {
      setActiveMenu(null);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveMenu(null);
      }
    }

    document.addEventListener("click", handleClose);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClose);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeMenu]);

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!activeMenu || !menu) return;

    const { anchorRect } = activeMenu;
    const menuRect = menu.getBoundingClientRect();
    const gap = 6;

    let top = anchorRect.bottom + gap;
    if (top + menuRect.height > window.innerHeight - 8) {
      top = Math.max(8, anchorRect.top - menuRect.height - gap);
    }

    let left = anchorRect.right - menuRect.width;
    if (left < 8) {
      left = 8;
    }

    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
  }, [activeMenu]);

  function updateRow(id: number, field: TimeField, event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;

    if ((field === "minute" || field === "second") && input.value.length > 2) {
      input.value = input.value.slice(0, 2);
    }

    const value = input.value;
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );

    if (field !== "multiplier" && value.length === 2) {
      const row = input.closest(".time-warp");
      if (!row) throw new Error("Time input is not inside a row");

      const inputs = Array.from(row.querySelectorAll<HTMLInputElement>("input.time"));
      const currentIndex = inputs.indexOf(input);
      const nextInput = inputs.slice(currentIndex + 1).find((item) => !item.disabled);
      if (nextInput) {
        nextInput.focus();
      } else {
        const currentRowIndex = rows.findIndex((item) => item.id === id);
        const nextRow = currentRowIndex >= 0 ? rows[currentRowIndex + 1] : undefined;
        if (nextRow) {
          const nextRowEl = timesRef.current?.querySelector(
            `[data-row-id="${nextRow.id}"]`,
          );
          nextRowEl?.querySelector<HTMLInputElement>("input.time:not(:disabled)")?.focus();
        } else {
          const newRow = createRow(nextRowId.current++);
          pendingFocusRow.current = newRow.id;
          setRows((currentRows) => [...currentRows, newRow]);
        }
      }
    }
  }

  function normalizeRowMultiplier(id: number, rawValue: string) {
    const parsed = +rawValue;
    if (Number.isNaN(parsed) || parsed <= 0) {
      setRows((currentRows) =>
        currentRows.map((row) =>
          row.id === id ? { ...row, multiplier: "1" } : row,
        ),
      );
    }
  }

  function addRow() {
    const newRow = createRow(nextRowId.current++);
    pendingFocusRow.current = newRow.id;
    setRows((currentRows) => [...currentRows, newRow]);
  }

  function clearRows() {
    setActiveMenu(null);
    setRows((currentRows) => currentRows.map((row) => createRow(row.id)));
  }

  function deleteAllRows() {
    setActiveMenu(null);
    setRows([]);
  }

  function toggleColumn(key: DurationField) {
    setColumns((currentColumns) => ({
      ...currentColumns,
      [key]: !currentColumns[key],
    }));
  }

  function toggleRowMenu(rowId: number, button: HTMLButtonElement) {
    const anchorRect = button.getBoundingClientRect();
    setActiveMenu((current) =>
      current?.type === "row" && current.rowId === rowId
        ? null
        : { type: "row", rowId, anchorRect },
    );
  }

  function toggleGlobalMenu(button: HTMLButtonElement) {
    const anchorRect = button.getBoundingClientRect();
    setActiveMenu((current) =>
      current?.type === "global" ? null : { type: "global", anchorRect },
    );
  }

  return (
    <>
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <div className="calculator-card">
        <header>
          <h1>Time Sum Calculator</h1>
        </header>

        <div className="result-container" aria-live="polite">
          <div className="result-label">Total Duration</div>
          <div id="calc-result" className="result-time">
            {formatTime(totalSeconds)}
          </div>
          <div id="calc-desc" className="result-description">
            {getFriendlyTimeDesc(totalSeconds)}
          </div>
        </div>

        <div className="toggle-bar">
          {timeFields.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`toggle-btn${columns[key] ? " active" : ""}`}
              id={`${key}Tog`}
              title={`Toggle ${label}`}
              aria-pressed={columns[key]}
              onClick={() => toggleColumn(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          id="times-wrapper"
          className={timesClassName}
          style={gridStyle}
          onScroll={() => setActiveMenu(null)}
        >
          <div className="times" ref={timesRef}>
            {rows.map((row, index) => {
              const badge = getMultiplierBadge(row.multiplier);
              const isRowMenuOpen =
                activeMenu?.type === "row" && activeMenu.rowId === row.id;

              return (
                <div className="time-warp" data-row-id={row.id} key={row.id}>
                  {timeFields.map(({ key, label, placeholder }) => (
                    <input
                      key={key}
                      type="number"
                      placeholder={placeholder}
                      aria-label={`${label} for row ${index + 1}`}
                      className={`${key}-col ${key} time`}
                      disabled={!columns[key]}
                      value={row[key]}
                      onChange={(event) => updateRow(row.id, key, event)}
                    />
                  ))}
                  <button
                    type="button"
                    className={`row-menu-btn${isRowMenuOpen ? " open" : ""}`}
                    title="Row actions"
                    aria-label={`Row ${index + 1} actions`}
                    aria-haspopup="menu"
                    aria-expanded={isRowMenuOpen}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleRowMenu(row.id, event.currentTarget);
                    }}
                  >
                    {badge && <span className="mul-badge">{badge}</span>}
                    <DotsIcon />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="add-row-section">
          <button
            type="button"
            className="primary-btn"
            id="add-time-btn"
            onClick={addRow}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            <span>Add Row</span>
          </button>
          <button
            type="button"
            id="global-menu-btn"
            className={`global-menu-btn${activeMenu?.type === "global" ? " open" : ""}`}
            title="More actions"
            aria-label="More actions"
            aria-haspopup="menu"
            aria-expanded={activeMenu?.type === "global"}
            onClick={(event) => {
              event.stopPropagation();
              toggleGlobalMenu(event.currentTarget);
            }}
          >
            <DotsIcon />
          </button>
        </div>
      </div>

      {activeMenu?.type === "row" && activeRow && (
        <div
          id="row-menu"
          ref={menuRef}
          className="row-menu"
          role="menu"
          onClick={(event) => event.stopPropagation()}
        >
          <label className="row-menu-item row-menu-mul-row" htmlFor="row-menu-mul">
            <span>Multiplier</span>
            <div className="row-menu-mul-wrap">
              <span className="mul-symbol">×</span>
              <input
                id="row-menu-mul"
                className="row-menu-mul-input"
                type="number"
                min="1"
                step="any"
                value={activeRow.multiplier}
                onChange={(event) => updateRow(activeRow.id, "multiplier", event)}
                onBlur={(event) =>
                  normalizeRowMultiplier(activeRow.id, event.currentTarget.value)
                }
              />
            </div>
          </label>
          <div className="row-menu-divider" />
          <button
            type="button"
            id="row-menu-delete"
            className="row-menu-item row-menu-delete"
            role="menuitem"
            onClick={() => {
              const rowId = activeRow.id;
              setActiveMenu(null);
              setRows((currentRows) =>
                currentRows.filter((currentRow) => currentRow.id !== rowId),
              );
            }}
          >
            <TrashIcon />
            <span>Delete Row</span>
          </button>
        </div>
      )}

      {activeMenu?.type === "global" && (
        <div
          id="global-menu"
          ref={menuRef}
          className="row-menu"
          role="menu"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            id="reset-times-btn"
            className="row-menu-item row-menu-clear"
            role="menuitem"
            onClick={clearRows}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.656 48.656 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3M3 12a48.291 48.291 0 0 0 .138 3.662 4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M3 12l-3 3m3-3 3 3"
              />
            </svg>
            <span>Clear Values</span>
          </button>
          <div className="row-menu-divider" />
          <button
            type="button"
            id="del-times-btn"
            className="row-menu-item row-menu-delete"
            role="menuitem"
            onClick={deleteAllRows}
          >
            <TrashIcon />
            <span>Delete All</span>
          </button>
        </div>
      )}
    </>
  );
}
