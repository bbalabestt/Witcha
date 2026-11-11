import { describe, expect, it } from "vitest";
import { isPreviewAuthorised } from "@/lib/http/preview-gate";

const basic = (user: string, pass: string) => `Basic ${btoa(`${user}:${pass}`)}`;

describe("preview gate", () => {
  it("is open when no password is set", () => expect(isPreviewAuthorised(null, undefined)).toBe(true));
  it("rejects a missing header", () => expect(isPreviewAuthorised(null, "tea")).toBe(false));
  it("rejects the wrong password", () => expect(isPreviewAuthorised(basic("x", "no"), "tea")).toBe(false));
  it("accepts any username with the right password", () => expect(isPreviewAuthorised(basic("x", "tea"), "tea")).toBe(true));
  it("keeps colons in the password", () => expect(isPreviewAuthorised(basic("x", "a:b"), "a:b")).toBe(true));
  it("survives malformed base64", () => expect(isPreviewAuthorised("Basic %%%", "tea")).toBe(false));
});
