const Gpio = require("onoff").Gpio;
const proximity = new Gpio(4, "out");

var timer = startTimer();

function restartTimer(timeout) {
  clearTimeout(timeout);
  timeout = null;
  timeout = startTimer();
}
function startTimer() {
  return setTimeout(() => {
    console.log("Timeout, turn off monitor");
    timer = null;
  }, 10000);
}

proximity.watch((err, value) => {
  if (err) {
    throw err;
  }

  if (timer == null) {
    console.log("Turn on monitor");
  }

  console.log(`Watch = ${value}`);
  restartTimer(timer);
});

process.on("SIGINT", () => {
  proximity.unexport();
});
