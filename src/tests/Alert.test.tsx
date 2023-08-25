import { render, screen } from "@testing-library/react";
import Alert from "../components/Alert";

describe("Alert", () => {
  it("renders with the given props", () => {
    const message = "This is an alert message";
    const severity = "error";
    render(<Alert severity={severity}>{message}</Alert>);
    const alertElement = screen.getByRole("alert");
    expect(alertElement).toBeTruthy();
    expect(alertElement.innerHTML).toContain(message);
  });
});