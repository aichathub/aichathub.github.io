import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import CodeBlock from "../components/CodeBlock";

// @ts-ignore
window.setImmediate = window.setTimeout;

describe("CodeBlock", () => {
  const content = "const x = 5;";
  const language = "javascript";
  global.URL.createObjectURL = jest.fn();

  it("renders the code content", () => {
    const { container } = render(<CodeBlock content={content} language={language} />);
    expect(container.querySelector("code")).toBeTruthy();
    expect(container.innerHTML).toMatch(/const.*x.*.*=.*5/);
  });

  it("renders the code language", () => {
    const { container } = render(<CodeBlock content={content} language={language} />);
    expect(container.innerHTML).toContain(language);
  });

  it("copies the code content when clicked", async () => {
    const writeText = jest.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });
    act(() => {
      const { container } = render(<CodeBlock content={content} language={language} />);
      const copyButton = container.querySelector(".MuiButtonBase-root");
      if (copyButton) {
        userEvent.click(copyButton);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(content);
      }
    })
  });
});