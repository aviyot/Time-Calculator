"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import {
  calculateTotalSeconds,
  formatTime,
  getFriendlyTimeDesc,
} from "../lib/time";
import type { TimeColumns, TimeField, TimeValues } from "../lib/time";

type TimeRow = TimeValues & { id: number };
type DurationField = Exclude<TimeField, "multiplier">;

const timeFields: { key: DurationField; label: string; placeholder: string }[] = [
  { key: "hour", label: "Hours", placeholder: "hh" },
  { key: "minute", label: "Minutes", placeholder: "mm" },
  { key: "second", label: "Seconds", placeholder: "ss" },
];

const toggleFields: { key: TimeField; label: string; id: string }[] = [
  { key: "hour", label: "Hours", id: "hourTog" },
  { key: "minute", label: "Minutes", id: "minuteTog" },
  { key: "second", label: "Seconds", id: "secondTog" },
  { key: "multiplier", label: "Multiplier", id: "mulTog" },
];

function createRow(id: number): TimeRow {
  return { id, hour: "", minute: "", second: "", multiplier: "1" };
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
  const [addCount, setAddCount] = useState("1");
  const nextRowId = useRef(2);
  const pendingFocusRow = useRef<number | null>(0);
  const timesRef = useRef<HTMLDivElement>(null);

  const gridTemplate = [
    columns.hour && "1fr",
    columns.minute && "1fr",
    columns.second && "1fr",
    columns.multiplier && "auto",
    columns.multiplier && "0.8fr",
    "44px",
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
    !columns.multiplier && "hide-mul",
  ]
    .filter(Boolean)
    .join(" ");

  const totalSeconds = calculateTotalSeconds(rows, columns);

  useEffect(() => {
    if (pendingFocusRow.current === null) return;

    const row = timesRef.current?.querySelector(
      `[data-row-id="${pendingFocusRow.current}"]`,
    );
    row?.querySelector<HTMLInputElement>("input.time:not(:disabled)")?.focus();
    pendingFocusRow.current = null;
  }, [rows]);

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
      nextInput?.focus();
    }
  }

  function addRows() {
    const count = +addCount || 1;
    const newRows: TimeRow[] = [];

    for (let i = 0; i < count; i++) {
      newRows.push(createRow(nextRowId.current++));
    }

    if (newRows.length > 0) {
      pendingFocusRow.current = newRows[0].id;
      setRows((currentRows) => [...currentRows, ...newRows]);
    }
    setAddCount("1");
  }

  function clearRows() {
    setRows((currentRows) => currentRows.map((row) => createRow(row.id)));
  }

  function toggleColumn(key: TimeField) {
    setColumns((currentColumns) => ({
      ...currentColumns,
      [key]: !currentColumns[key],
    }));
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
          {toggleFields.map(({ key, label, id }) => (
            <button
              key={key}
              type="button"
              className={`toggle-btn${columns[key] ? " active" : ""}`}
              id={id}
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
        >
          <div className="grid-header">
            {timeFields.map(({ key, label }) => (
              <div key={key} className={`header-cell ${key}-col`}>
                {label}
              </div>
            ))}
            <div className="header-cell mul-col mul-col-sym" />
            <div className="header-cell mul-col">Multiplier</div>
            <div className="header-cell del-col" />
          </div>

          <div className="times" ref={timesRef}>
            {rows.map((row, index) => (
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
                <span className="mul-symbol mul-col mul-col-sym">×</span>
                <input
                  type="number"
                  aria-label={`Multiplier for row ${index + 1}`}
                  className="mul-col mul"
                  disabled={!columns.multiplier}
                  value={row.multiplier}
                  onChange={(event) => updateRow(row.id, "multiplier", event)}
                />
                <button
                  type="button"
                  className="del-btn del-col"
                  aria-label={`Delete row ${index + 1}`}
                  onClick={() =>
                    setRows((currentRows) =>
                      currentRows.filter((currentRow) => currentRow.id !== row.id),
                    )
                  }
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="add-row-section">
          <input
            id="ntime"
            className="add-count-input"
            type="number"
            min="1"
            aria-label="Number of rows to add"
            value={addCount}
            onChange={(event) => setAddCount(event.target.value)}
          />
          <button type="button" className="primary-btn" id="add-time-btn" onClick={addRows}>
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
            <span>Add Rows</span>
          </button>
        </div>

        <div className="action-row">
          <button
            type="button"
            className="secondary-btn clear-btn"
            id="reset-times-btn"
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
          <button
            type="button"
            className="secondary-btn delete-all-btn"
            id="del-times-btn"
            onClick={() => setRows([])}
          >
            <TrashIcon />
            <span>Delete All</span>
          </button>
        </div>
      </div>
    </>
  );
}
