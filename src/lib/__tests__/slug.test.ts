import { describe, expect, it } from "vitest";
import { slugify, vehicleSlug } from "../slug";

describe("slugify", () => {
  it("removes accents and lowercases", () => {
    expect(slugify("Citroën C4 Pallas")).toBe("citroen-c4-pallas");
  });

  it("collapses whitespace and dashes", () => {
    expect(slugify("  Toyota   Corolla  --  XEi  ")).toBe("toyota-corolla-xei");
  });

  it("strips non-alphanumeric characters", () => {
    expect(slugify("Onix 1.0 Turbo (LTZ)!")).toBe("onix-10-turbo-ltz");
  });
});

describe("vehicleSlug", () => {
  it("composes a stable slug from parts", () => {
    expect(
      vehicleSlug({
        brand: "VW",
        model: "Polo",
        version: "Highline",
        yearModel: 2024,
        id: "abc123",
      }),
    ).toBe("vw-polo-highline-2024-abc123");
  });
});
