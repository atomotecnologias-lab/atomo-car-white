import { describe, expect, it } from "vitest";
import { whatsappLink, vehicleInterestMessage, generalMessage } from "../whatsapp";
import type { Vehicle } from "@/types";

const v = {
  brand: "VW",
  model: "Polo",
  version: "Highline",
  yearManufacture: 2023,
  yearModel: 2024,
  mileage: 12000,
  color: "Prata",
  price: 95000,
} as unknown as Vehicle;

describe("whatsapp", () => {
  it("builds a wa.me link with encoded text", () => {
    const url = whatsappLink("5547999998888", "Olá mundo");
    expect(url).toBe("https://wa.me/5547999998888?text=Ol%C3%A1%20mundo");
  });

  it("composes a vehicle interest message with key fields", () => {
    const msg = vehicleInterestMessage(v);
    expect(msg).toContain("VW Polo Highline");
    expect(msg).toContain("2023/2024");
    expect(msg).toContain("12.000 km");
    expect(msg).toContain("Prata");
  });

  it("returns a default general message", () => {
    expect(generalMessage()).toMatch(/Primos Autom/);
  });
});
