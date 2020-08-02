import React from "react";
import App from "./App";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("App", () => {
  describe("When a user types currency amount should convert it", () => {
    it("shoudl convert it", () => {
      const rendered = render(<App />);
      const emailInput = rendered.findByTestId("x1");
      userEvent.type(emailInput, "20");
    });
  });
});
