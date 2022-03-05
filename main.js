let hourDisabled = false;
let minuteDisabled = false;
let secondDisabled = false;

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
}
init();

function onInputValue(ev) {
  const curTarget = ev.currentTarget;
  if (curTarget.value.length == 2) {
    if (curTarget.nextSibling) {
      if (!ev.currentTarget.nextSibling.disabled) {
        ev.currentTarget.nextSibling.focus();
      } else {
        if (ev.currentTarget.nextSibling.nextSibling)
          ev.currentTarget.nextSibling.nextSibling.focus();
        else ev.currentTarget.nextSibling.blur();
      }
    } else curTarget.blur();
  }
  calcTotalTime();
}
function addTime() {
  var times = document.querySelector(".times");

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

  times.appendChild(h);
  times.appendChild(m);
  times.appendChild(s);

  h.focus();

  return {
    h,
    m,
    s,
  };
}

function getTimesRef() {
  var houres = document.querySelectorAll(".hour");
  var minutes = document.querySelectorAll(".minute");
  var seconds = document.querySelectorAll(".second");

  return {
    houres,
    minutes,
    seconds,
  };
}

function resetAllTimes() {
  const { houres, minutes, seconds } = getTimesRef();
  houres.forEach((hour) => {
    hour.value = "";
  });

  minutes.forEach((minute) => {
    minute.value = "";
  });

  seconds.forEach((second) => {
    second.value = "";
  });

  calcTotalTime();
}

function deleteAllTimes() {
  const { houres, minutes, seconds } = getTimesRef();
  houres.forEach((hour) => {
    hour.parentNode.removeChild(hour);
  });

  minutes.forEach((minute) => {
    minute.parentNode.removeChild(minute);
  });

  seconds.forEach((second) => {
    second.parentNode.removeChild(second);
  });
  calcTotalTime();
}

function calcTotalTime() {
  const { houres, minutes, seconds } = getTimesRef();
  var calcResult = document.querySelector("#calc-result");
  var totalHoures = 0;
  var totalMinutes = 0;
  var totalSeconds = 0;
  var totalTimeOnSeconds = 0;

  houres.forEach((hour) => {
    totalTimeOnSeconds += +hour.value * 60 * 60;
  });

  minutes.forEach((minute) => {
    totalTimeOnSeconds += +minute.value * 60;
  });

  seconds.forEach((second) => {
    totalTimeOnSeconds += +second.value;
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
