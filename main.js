let hourDisabled = false;
let minuteDisabled = false;
let secondDisabled = false;
let timeElements = [];

function init() {
  document.querySelector("#add-time-btn").addEventListener("click", addTimes);

  document
    .querySelector("#reset-times-btn")
    .addEventListener("click", resetAllTimes);
  //deleteAllTimes
  document
    .querySelector("#del-times-btn")
    .addEventListener("click", deleteAllTimes);

  addTimes(null, 2);

  let hourTogRef = document.querySelector("#hourTog");
  let minuteTogRef = document.querySelector("#minuteTog");
  let secondTogRef = document.querySelector("#secondTog");

  hourTogRef.addEventListener("click", toogleHour);
  minuteTogRef.addEventListener("click", toogleMinute);
  secondTogRef.addEventListener("click", toogleSecond);

  let del = document.querySelectorAll(".del");
  del.forEach((delEl) => {
    delEl.addEventListener("click", deleteTime);
  });

  calcTotalTime();
}
init();

function onInputValue(ev) {
  const curTarget = ev.currentTarget;

  const activeElement = timeElements.findIndex((te) => {
    return document.activeElement === te;
  });

  if (curTarget.value.length == 2) {
    if (timeElements[activeElement + 1]) {
      if (!timeElements[activeElement + 1].disabled) {
        timeElements[activeElement + 1].focus();
      } else {
        if (timeElements[activeElement + 2])
          timeElements[activeElement + 2].focus();
        else document.querySelector("#add-time-btn").focus();
      }
    } else document.querySelector("#add-time-btn").focus();
  }
  calcTotalTime();
}
function addTime() {
  var times = document.querySelector(".times");
  var timeWarp = document.createElement("div");
  timeWarp.classList.add("time-warp");

  var h = document.createElement("input");
  h.setAttribute("type", "number");
  h.setAttribute("placeholder", "hh");
  h.classList.add("hour", "time");
  if (hourDisabled) h.disabled = true;
  h.addEventListener("input", onInputValue);

  var m = document.createElement("input");
  m.setAttribute("type", "number");
  m.setAttribute("placeholder", "mm");
  m.classList.add("minute", "time");
  if (minuteDisabled) m.disabled = true;
  m.addEventListener("input", onInputValue);

  var s = document.createElement("input");
  s.setAttribute("type", "number");
  s.setAttribute("placeholder", "ss");
  s.classList.add("second", "time");
  if (secondDisabled) s.disabled = true;
  s.addEventListener("input", onInputValue);

  var mul = document.createElement("input");
  mul.setAttribute("type", "number");
  mul.value = "1";
  mul.classList.add("mul");
  mul.addEventListener("input", onInputValue);

  var del = document.createElement("input");
  del.setAttribute("type", "button");
  del.value = "x";
  del.classList.add("del");
  del.addEventListener("click", deleteTime);

  timeWarp.appendChild(h);
  timeWarp.appendChild(m);
  timeWarp.appendChild(s);
  timeWarp.appendChild(mul);
  timeWarp.appendChild(del);
  times.appendChild(timeWarp);

  h.focus();

  timeElements.push(h);
  timeElements.push(m);
  timeElements.push(s);

  return {
    h,
    m,
    s,
  };
}

function resetAllTimes() {
  var times = document.querySelectorAll(".time-warp");

  times.forEach((time) => {
    time.querySelector(".hour").value = "";
    time.querySelector(".minute").value = "";
    time.querySelector(".second").value = "";
    time.querySelector(".mul").value = "1";
  });

  calcTotalTime();
}

function deleteTime(ev) {
  const curTarget = ev.currentTarget;

  curTarget.parentNode.parentNode.removeChild(curTarget.parentNode);
  calcTotalTime();
}
function deleteAllTimes() {
  var times = document.querySelectorAll(".time-warp");

  times.forEach((time) => {
    time.parentNode.removeChild(time);
  });

  timeElements = [];
  calcTotalTime();
}

function calcTotalTime() {
  var calcResult = document.querySelector("#calc-result");
  var totalTimeOnSeconds = 0;
  var times = document.querySelectorAll(".time-warp");
  times.forEach((time) => {
    var hour = +time.querySelector(".hour").value;
    var minute = +time.querySelector(".minute").value;
    var second = +time.querySelector(".second").value;
    var mul = +time.querySelector(".mul").value;

    totalTimeOnSeconds += (hour * 60 * 60 + minute * 60 + second) * mul;
  });

  calcResult.textContent = convertSecondsToTime(totalTimeOnSeconds);
}

function convertSecondsToTime(totalTimeOnSeconds) {
  var houres = 0;
  var minutes = 0;
  var seconds = 0;
  var remainder = 0;

  houres = totalTimeOnSeconds / (60 * 60);
  remainder = totalTimeOnSeconds % (60 * 60);

  minutes = remainder / 60;
  seconds = remainder % 60;

  return (
    padStart(Math.trunc(houres)) +
    ":" +
    padStart(Math.trunc(minutes)) +
    ":" +
    padStart(Math.trunc(seconds))
  );
}

function padStart(val) {
  if (val < 10) {
    return "0" + val;
  } else return val;
}

function auto_grow(element) {
  element.style.height = "5px";
  element.style.height = element.scrollHeight + "px";
}

function addTimes(ev, n) {
  let fristTime = null;
  var ntime = document.querySelector("#ntime");
  if (n === undefined) n = +ntime.value;

  if (n > 0) fristTime = addTime().h;

  for (let i = 1; i < n; i++) {
    addTime();
  }
  if (fristTime) {
    fristTime.focus();
  }

  ntime.value = 1;
  calcTotalTime();
}

function toogleHour() {
  const hourTimes = document.querySelectorAll(".hour");

  hourTimes.forEach((hourTime) => {
    hourTime.disabled = !hourDisabled;
  });

  hourDisabled = !hourDisabled;
}

function toogleMinute() {
  const minuteTimes = document.querySelectorAll(".minute");

  minuteTimes.forEach((minuteTime) => {
    minuteTime.disabled = !minuteDisabled;
  });

  minuteDisabled = !minuteDisabled;
}

function toogleSecond() {
  const secondsTimes = document.querySelectorAll(".second");

  secondsTimes.forEach((secondsTime) => {
    secondsTime.disabled = !secondDisabled;
  });
  secondDisabled = !secondDisabled;
}
