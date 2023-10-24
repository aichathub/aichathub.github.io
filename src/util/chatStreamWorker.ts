const workercode = () => {
  let timerInterval: NodeJS.Timer;
  let time = 0;
  let message = "";
  /* eslint-disable-next-line no-restricted-globals */
  self.onmessage = function ({ data: { turn, preContent } }) {
    if (preContent) {
      message = preContent;
      return;
    }
    if (turn === "off" || timerInterval) {
      clearInterval(timerInterval);
      time = 0;
    }
    if (turn === "on") {
      timerInterval = setInterval(() => {
        /* eslint-disable-next-line no-restricted-globals */
        self.postMessage({ newWord: message.split(" ")[time] });
        time += 1;
      }, 100);
    }
  };
};

let code = workercode.toString();
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

const blob = new Blob([code], { type: "application/javascript" });
export const chatStreamWorker = URL.createObjectURL(blob);