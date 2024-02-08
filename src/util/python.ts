type Pyodide = {
  runPythonAsync: (code: string) => Promise<string>;
};

declare global {
  interface Window {
    loadPyodide: (cfg: { indexURL: string }) => Promise<Pyodide>;
    pyodide?: Pyodide;
  }
}

const captureStdOut =
  "from random import randint\r\nimport sys\r\nimport io\r\nsys.stdout = io.StringIO()\r\n";

export const runPythonLocal = async (code: string) => {
  let pyodide = window.pyodide;
  if (!pyodide) {
    pyodide = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
    });
    window.pyodide = pyodide;
  }
  try {
    let result = await pyodide.runPythonAsync(captureStdOut + code);
    if (!result) {
      result = await pyodide.runPythonAsync("sys.stdout.getvalue()");
    }
    if (typeof result === "function") {
      result = "Unknown error occurred";
    }
    return result;
  } catch (error: any) {
    if (error instanceof Error) return error.message;
    return String(error);
  }
};
