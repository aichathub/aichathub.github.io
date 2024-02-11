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
  "import math\r\nimport random\r\nfrom random import choice\r\nfrom random import randint\r\nimport sys\r\nimport io\r\nsys.stdout = io.StringIO()\r\n";

const extension = "def factors(n): print([('{} * {}'.format(i, n//i)) for i in range(1, math.ceil(math.sqrt(n)) + 1) if n % i == 0])\r\n"

export const runPythonLocal = async (code: string) => {
  let pyodide = window.pyodide;
  if (!pyodide) {
    pyodide = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
    });
    window.pyodide = pyodide;
  }
  try {
    let result = await pyodide.runPythonAsync(captureStdOut + extension + code);
    if (!result) {
      result = await pyodide.runPythonAsync("sys.stdout.getvalue()");
    }
    if (typeof result === "function") {
      result = "[ERROR] Unknown error occurred";
    }
    return result.toString();
  } catch (error: any) {
    if (error instanceof Error) return `[ERROR] ${error.message}`;
    return `[ERROR] ${String(error)}`;
  }
};
