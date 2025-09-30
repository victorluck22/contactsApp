import { render, screen } from "@testing-library/react";
import React from "react";
import { Button } from "../components/Button.jsx";

describe("Button", () => {
  it("renderiza children", () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByText("Enviar")).toBeInTheDocument();
  });

  it("usa variant filled por default", () => {
    render(<Button>OK</Button>);
    const btn = screen.getByText("OK");
    expect(btn.getAttribute("data-variant")).toBe("filled");
  });

  it("aceita variant tonal", () => {
    render(<Button variant="tonal">Tonal</Button>);
    expect(screen.getByText("Tonal").getAttribute("data-variant")).toBe(
      "tonal"
    );
  });

  it("mapeia alias legacy solid para filled", () => {
    render(<Button variant="solid">Legacy</Button>);
    expect(screen.getByText("Legacy").getAttribute("data-variant")).toBe(
      "filled"
    );
  });
});
