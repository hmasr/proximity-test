const Gpio = require("onoff").Gpio;
const proximity = new Gpio(4, "in", "rising");

try {
  var timer = startTimer();

  function restartTimer(timeout) {
    console.log("restartTimer");
    clearTimeout(timeout);
    timeout = null;
    timeout = startTimer();
  }
  function startTimer() {
    console.log("startTimer");
    return setTimeout(() => {
      console.log("timer elapsed");
      timer = null;
    }, 10000);
  }

  proximity.watch((err, value) => {
    try {
      if (err) {
        throw err;
      }

      if (timer == null) {
        console.log("Turn on monitor");
        timer = startTimer();
      }

      console.log(`Watch = ${value}`);
      restartTimer(timer);
    } catch (error) {
      console.error(error);
    }
  });

  process.on("SIGINT", () => {
    proximity.unexport();
  });
} catch (error) {
  console.error(error);
}
