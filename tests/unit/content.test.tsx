import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { ContactForm, validateContact } from "@/components/content/ContactForm";
import { TasteDial } from "@/components/home/TasteDial";
import { PREP_METHODS } from "@/lib/data/fixtures/data";
import { prepFor } from "@/lib/data/product";

afterEach(cleanup);

describe("prepFor", () => {
  it("maps guide methods to the tea's prep methods", () => {
    expect(prepFor("Whisk", PREP_METHODS)?.water).toBe("70 ml · 80°C");
    expect(prepFor("Iced", PREP_METHODS)?.method).toBe("Iced latte");
    expect(prepFor("Shaker", [])).toBeUndefined();
  });
});

describe("contact form", () => {
  it("validates required fields", () => {
    expect(validateContact({ name: "", email: "x", message: "short" })).toEqual({
      name: "Add your name.",
      email: "Check the email address, e.g. name@example.com.",
      message: "Tell us a little more (at least 10 characters).",
    });
    expect(validateContact({ name: "Mai", email: "mai@example.com", message: "Hello there, a question." })).toEqual({});
  });

  it("shows inline errors and prefills from the review link", async () => {
    render(<ContactForm topic="review" product="Yame no Mukashi" />);
    expect((screen.getByRole("combobox", { name: "What’s it about?" }) as HTMLSelectElement).value).toBe("review");
    expect((screen.getByRole("textbox", { name: "Message" }) as HTMLTextAreaElement).value).toBe("About Yame no Mukashi: ");
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(screen.getByText("Add your name.")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Name" }).getAttribute("aria-invalid")).toBe("true");
  });
});

describe("TasteDial", () => {
  it("is a keyboard slider that swaps the suggestion", async () => {
    render(<TasteDial bright={<p>bright card</p>} balanced={<p>set card</p>} deep={<p>deep card</p>} />);
    const slider = screen.getByRole("slider", { name: "Taste, bright to deep" });
    expect(slider.getAttribute("aria-valuetext")).toBe("Deep, 4 of 5");
    expect(screen.getByText("deep card")).toBeTruthy();
    slider.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(slider.getAttribute("aria-valuenow")).toBe("3");
    expect(screen.getByText("set card")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Taste 1 of 5" }));
    expect(slider.getAttribute("aria-valuetext")).toBe("Fresh, 1 of 5");
    expect(screen.getByText("bright card")).toBeTruthy();
  });
});
