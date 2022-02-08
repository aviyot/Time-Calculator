function init() {
  document.querySelector("#add-time-btn").addEventListener("click", addTimes);
  document
    .querySelector("#calc-texarea-method")
    .addEventListener("click", calcTotalTimeText);
  document.getElementById("inputs").addEventListener("click", selectCalcMethod);
  document.getElementById("text").addEventListener("click", selectCalcMethod);
  document
    .querySelector("#reset-times-btn")
    .addEventListener("click", resetAllTimes);
  //deleteAllTimes
  document
    .querySelector("#del-times-btn")
    .addEventListener("click", deleteAllTimes);

  addTimes(null, 2);
}
init();

function onInputValue(ev) {
  const curTarget = ev.currentTarget;
  if (curTarget.value.length == 2) {
    if (curTarget.nextSibling) ev.currentTarget.nextSibling.focus();
    else curTarget.blur();
  }
  calcTotalTime();
}
function addTime() {
  var times = document.querySelector(".times");

  var h = document.createElement("input");
  h.setAttribute("type", "number");
  h.setAttribute("placeholder", "hh");
  h.classList.add("hour", "time");
  h.addEventListener("input", onInputValue);

  var m = document.createElement("input");
  m.setAttribute("type", "number");
  m.setAttribute("placeholder", "mm");
  m.classList.add("minute", "time");
  m.addEventListener("input", onInputValue);

  var s = document.createElement("input");
  s.setAttribute("type", "number");
  s.setAttribute("placeholder", "ss");
  s.classList.add("second", "time");
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

function calcTotalTimeText() {
  var calcResult = document.querySelector("#calc-result");

  var totalTime = 0;
  var time_enter = document.querySelector("#time-enter").value;

  times = time_enter.split(" ");
  times.forEach((time) => {
    totalTime += +(time.slice(0, 2) * 60 * 60);
    totalTime += +(time.slice(2, 4) * 60);
    totalTime += +time.slice(4, 6);
  });

  calcResult.textContent = convertSecondsToTime(totalTime);
}

function selectCalcMethod(ev) {
  var inputs = document.getElementById("inputs");
  var text = document.getElementById("text");
  var result = document.getElementById("result");

  var inputs_method = document.getElementById("inputs-method");
  var textarea_method = document.getElementById("textarea-method");

  result.style.order = "2";

  if (ev.currentTarget.id == "inputs") {
    inputs.classList.add("border_b");
    text.classList.remove("border_b");
    inputs_method.style.visibility = "visible";
    textarea_method.style.visibility = "hidden";
    textarea_method.style.order = "3";
    inputs_method.style.order = "1";
  }
  if (ev.currentTarget.id == "text") {
    text.classList.add("border_b");
    inputs.classList.remove("border_b");
    textarea_method.style.visibility = "visible";
    inputs_method.style.visibility = "hidden";
    textarea_method.style.order = "1";
    inputs_method.style.order = "3";
  }
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
