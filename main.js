const state = {
  hour: true,
  minute: true,
  second: true
};

let activeMenuRow = null;
let activeMenuBtn = null;

function init() {
  document.querySelector("#add-time-btn").addEventListener("click", () => addTimes());
  document.querySelector("#reset-times-btn").addEventListener("click", resetAllTimes);
  document.querySelector("#del-times-btn").addEventListener("click", deleteAllTimes);

  document.querySelector("#hourTog").addEventListener("click", () => toggleColumn("hour"));
  document.querySelector("#minuteTog").addEventListener("click", () => toggleColumn("minute"));
  document.querySelector("#secondTog").addEventListener("click", () => toggleColumn("second"));

  initRowMenu();
  initGlobalMenu();

  // Apply initial layout template
  updateGridTemplate();

  // Add 2 default rows
  addTimes(2);
}

document.addEventListener("DOMContentLoaded", init);

function onInputValue(ev) {
  const input = ev.currentTarget;

  // Clamp digits for MM and SS to maximum 2 characters
  if (input.classList.contains("minute") || input.classList.contains("second")) {
    if (input.value.length > 2) {
      input.value = input.value.slice(0, 2);
    }
  }

  // Recalculate total
  calcTotalTime();

  // Handle focus transition if value has 2 digits (and it's not the multiplier)
  if (input.value.length === 2 && !input.classList.contains("mul")) {
    const row = input.closest(".time-warp");
    if (row) {
      const inputs = Array.from(row.querySelectorAll("input.time"));
      const idx = inputs.indexOf(input);
      // Move focus to next enabled input in current row
      let moved = false;
      for (let i = idx + 1; i < inputs.length; i++) {
        if (!inputs[i].disabled) {
          inputs[i].focus();
          moved = true;
          break;
        }
      }

      // If at the last enabled time input in the row, move to the next row (creating one if needed)
      if (!moved) {
        let nextRow = row.nextElementSibling;
        if (!nextRow || !nextRow.classList.contains("time-warp")) {
          addTime();
          nextRow = row.nextElementSibling;
        }
        const nextInput = getFirstEnabledTimeInput(nextRow);
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  }
}

function getFirstEnabledTimeInput(row) {
  if (!row) return null;
  const inputs = row.querySelectorAll("input.time");
  for (const input of inputs) {
    if (!input.disabled) {
      return input;
    }
  }
  return null;
}

function initRowMenu() {
  const menu = document.querySelector("#row-menu");
  const mulInput = document.querySelector("#row-menu-mul");
  const deleteBtn = document.querySelector("#row-menu-delete");
  const timesWrapper = document.querySelector("#times-wrapper");

  if (!menu || !mulInput || !deleteBtn) return;

  // Prevent clicks inside the floating menu from triggering outside-click close
  menu.addEventListener("click", (ev) => ev.stopPropagation());

  mulInput.addEventListener("input", () => {
    if (!activeMenuRow) return;
    activeMenuRow.dataset.mul = mulInput.value;
    updateRowMultiplierBadge(activeMenuRow);
    calcTotalTime();
  });

  mulInput.addEventListener("blur", () => {
    if (!activeMenuRow) return;
    const val = +mulInput.value;
    if (isNaN(val) || val <= 0) {
      mulInput.value = "1";
      activeMenuRow.dataset.mul = "1";
      updateRowMultiplierBadge(activeMenuRow);
      calcTotalTime();
    }
  });

  deleteBtn.addEventListener("click", () => {
    if (!activeMenuRow) return;
    const rowToRemove = activeMenuRow;
    closeRowMenu();
    rowToRemove.remove();
    calcTotalTime();
  });

  document.addEventListener("click", closeAllMenus);
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") closeAllMenus();
  });
  if (timesWrapper) {
    timesWrapper.addEventListener("scroll", closeAllMenus);
  }
}

function initGlobalMenu() {
  const menuBtn = document.querySelector("#global-menu-btn");
  const menu = document.querySelector("#global-menu");
  if (!menuBtn || !menu) return;

  menu.addEventListener("click", (ev) => ev.stopPropagation());

  menuBtn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    const isOpen = !menu.classList.contains("hidden");
    closeAllMenus();
    if (isOpen) return;

    menuBtn.classList.add("open");
    menuBtn.setAttribute("aria-expanded", "true");
    positionMenu(menu, menuBtn);
  });
}

function positionMenu(menu, anchorBtn) {
  menu.classList.remove("hidden");
  menu.setAttribute("aria-hidden", "false");

  const rect = anchorBtn.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const gap = 6;

  let top = rect.bottom + gap;
  if (top + menuRect.height > window.innerHeight - 8) {
    top = Math.max(8, rect.top - menuRect.height - gap);
  }

  let left = rect.right - menuRect.width;
  if (left < 8) {
    left = 8;
  }

  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;
}

function openRowMenu(row, btn) {
  const menu = document.querySelector("#row-menu");
  const mulInput = document.querySelector("#row-menu-mul");
  if (!menu || !mulInput) return;

  if (activeMenuRow === row && !menu.classList.contains("hidden")) {
    closeAllMenus();
    return;
  }

  closeAllMenus();
  activeMenuRow = row;
  activeMenuBtn = btn;
  btn.classList.add("open");

  mulInput.value = row.dataset.mul || "1";
  positionMenu(menu, btn);
}

function closeRowMenu() {
  const menu = document.querySelector("#row-menu");
  if (menu) {
    menu.classList.add("hidden");
    menu.setAttribute("aria-hidden", "true");
  }
  if (activeMenuBtn) {
    activeMenuBtn.classList.remove("open");
  }
  activeMenuRow = null;
  activeMenuBtn = null;
}

function closeGlobalMenu() {
  const menu = document.querySelector("#global-menu");
  const menuBtn = document.querySelector("#global-menu-btn");
  if (menu) {
    menu.classList.add("hidden");
    menu.setAttribute("aria-hidden", "true");
  }
  if (menuBtn) {
    menuBtn.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }
}

function closeAllMenus() {
  closeRowMenu();
  closeGlobalMenu();
}

function updateRowMultiplierBadge(row) {
  const badge = row.querySelector(".mul-badge");
  if (!badge) return;
  const mul = +(row.dataset.mul || 1);
  if (!isNaN(mul) && mul > 0 && mul !== 1) {
    badge.textContent = `×${mul}`;
    badge.classList.remove("hidden");
  } else {
    badge.textContent = "";
    badge.classList.add("hidden");
  }
}

function addTime() {
  const timesContainer = document.querySelector(".times");
  const timeWarp = document.createElement("div");
  timeWarp.classList.add("time-warp");
  timeWarp.dataset.mul = "1";

  const h = document.createElement("input");
  h.type = "number";
  h.placeholder = "hh";
  h.classList.add("hour-col", "hour", "time");
  h.disabled = !state.hour;
  h.addEventListener("input", onInputValue);

  const m = document.createElement("input");
  m.type = "number";
  m.placeholder = "mm";
  m.classList.add("minute-col", "minute", "time");
  m.disabled = !state.minute;
  m.addEventListener("input", onInputValue);

  const s = document.createElement("input");
  s.type = "number";
  s.placeholder = "ss";
  s.classList.add("second-col", "second", "time");
  s.disabled = !state.second;
  s.addEventListener("input", onInputValue);

  const menuBtn = document.createElement("button");
  menuBtn.type = "button";
  menuBtn.classList.add("row-menu-btn");
  menuBtn.title = "Row actions";
  menuBtn.setAttribute("aria-label", "Row actions");
  menuBtn.innerHTML = `
    <span class="mul-badge hidden"></span>
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  `;
  menuBtn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    openRowMenu(timeWarp, menuBtn);
  });

  timeWarp.appendChild(h);
  timeWarp.appendChild(m);
  timeWarp.appendChild(s);
  timeWarp.appendChild(menuBtn);
  timesContainer.appendChild(timeWarp);

  return { hour: h, minute: m, second: s };
}

function addTimes(n = 1) {
  const count = n > 0 ? n : 1;

  let firstInput = null;
  for (let i = 0; i < count; i++) {
    const rowInputs = addTime();
    if (i === 0) {
      if (state.hour) firstInput = rowInputs.hour;
      else if (state.minute) firstInput = rowInputs.minute;
      else if (state.second) firstInput = rowInputs.second;
    }
  }

  if (firstInput) {
    firstInput.focus();
  }

  calcTotalTime();
}

function resetAllTimes() {
  closeAllMenus();
  const times = document.querySelectorAll(".time-warp");
  times.forEach((time) => {
    time.querySelector(".hour").value = "";
    time.querySelector(".minute").value = "";
    time.querySelector(".second").value = "";
    time.dataset.mul = "1";
    updateRowMultiplierBadge(time);
  });
  calcTotalTime();
}

function deleteAllTimes() {
  closeAllMenus();
  const times = document.querySelectorAll(".time-warp");
  times.forEach((time) => {
    time.remove();
  });
  calcTotalTime();
}

function toggleColumn(col) {
  state[col] = !state[col];

  // Update button active state
  const btn = document.querySelector(`#${col}Tog`);
  if (btn) {
    if (state[col]) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  }

  // Map state property name to CSS class name
  let cssClass = '';
  if (col === 'hour') cssClass = 'hide-hours';
  if (col === 'minute') cssClass = 'hide-minutes';
  if (col === 'second') cssClass = 'hide-seconds';

  // Toggle CSS class on the container to hide elements via display: none
  const container = document.querySelector("#times-wrapper");
  if (container) {
    if (state[col]) {
      container.classList.remove(cssClass);
    } else {
      container.classList.add(cssClass);
    }
  }

  // Update existing input active disabled state
  let selector = '';
  if (col === 'hour') selector = '.hour';
  if (col === 'minute') selector = '.minute';
  if (col === 'second') selector = '.second';

  const inputs = document.querySelectorAll(selector);
  inputs.forEach((input) => {
    input.disabled = !state[col];
  });

  // Re-calculate column layout
  updateGridTemplate();

  // Re-sum values
  calcTotalTime();
}

function updateGridTemplate() {
  const cols = [];
  if (state.hour) cols.push("1fr");
  if (state.minute) cols.push("1fr");
  if (state.second) cols.push("1fr");
  cols.push("auto"); // row actions menu button
  
  const template = cols.join(" ");
  document.documentElement.style.setProperty("--grid-template", template);
}

function calcTotalTime() {
  const calcResult = document.querySelector("#calc-result");
  const calcDesc = document.querySelector("#calc-desc");
  let totalTimeOnSeconds = 0;
  
  const times = document.querySelectorAll(".time-warp");
  times.forEach((time) => {
    const hour = state.hour ? +time.querySelector(".hour").value : 0;
    const minute = state.minute ? +time.querySelector(".minute").value : 0;
    const second = state.second ? +time.querySelector(".second").value : 0;
    let mul = +(time.dataset.mul || 1);

    if (isNaN(mul) || mul <= 0) mul = 1;

    totalTimeOnSeconds += (hour * 3600 + minute * 60 + second) * mul;
  });

  calcResult.textContent = convertSecondsToTime(totalTimeOnSeconds);
  calcDesc.textContent = getFriendlyTimeDesc(totalTimeOnSeconds);
}

function convertSecondsToTime(totalTimeOnSeconds) {
  let houres = 0;
  let minutes = 0;
  let seconds = 0;
  let remainder = 0;

  houres = totalTimeOnSeconds / 3600;
  remainder = totalTimeOnSeconds % 3600;

  minutes = remainder / 60;
  seconds = remainder % 60;

  return (
    padZero(Math.trunc(houres)) +
    ":" +
    padZero(Math.trunc(minutes)) +
    ":" +
    padZero(Math.trunc(seconds))
  );
}

function padZero(val) {
  return val < 10 ? "0" + val : val;
}

function getFriendlyTimeDesc(totalSeconds) {
  if (totalSeconds === 0) return "0 hours, 0 minutes, 0 seconds";
  
  const hours = Math.floor(totalSeconds / 3600);
  const remainder = totalSeconds % 3600;
  const minutes = Math.floor(remainder / 60);
  const seconds = remainder % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  if (seconds > 0) parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);
  
  return parts.join(", ");
}
