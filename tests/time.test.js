import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateTotalSeconds,
  formatTime,
  getFriendlyTimeDesc,
} from "../lib/time.js";

const allColumns = {
  hour: true,
  minute: true,
  second: true,
  multiplier: true,
};

test("sums rows with multipliers and excludes disabled columns", () => {
  const rows = [
    { hour: "1", minute: "30", second: "15", multiplier: "2" },
    { hour: "", minute: "45", second: "", multiplier: "1" },
  ];

  assert.equal(formatTime(calculateTotalSeconds(rows, allColumns)), "03:45:30");
  assert.equal(
    formatTime(calculateTotalSeconds(rows, { ...allColumns, hour: false })),
    "01:45:30",
  );
  assert.equal(
    formatTime(
      calculateTotalSeconds(rows, {
        ...allColumns,
        hour: false,
        multiplier: false,
      }),
    ),
    "01:15:15",
  );
});

test("uses a multiplier of one for empty or non-positive values", () => {
  const rows = ["", "0", "-2", "1.5"].map((multiplier) => ({
    hour: "",
    minute: "",
    second: "10",
    multiplier,
  }));

  assert.equal(calculateTotalSeconds(rows, allColumns), 45);
  assert.equal(calculateTotalSeconds([], allColumns), 0);
});

test("formats long and fractional durations and friendly descriptions", () => {
  assert.equal(formatTime(360065), "100:01:05");
  assert.equal(formatTime(61.5), "00:01:01");
  assert.equal(getFriendlyTimeDesc(0), "0 hours, 0 minutes, 0 seconds");
  assert.equal(getFriendlyTimeDesc(3661), "1 hour, 1 minute, 1 second");
  assert.equal(getFriendlyTimeDesc(61.5), "1 minute, 1.5 seconds");
});
