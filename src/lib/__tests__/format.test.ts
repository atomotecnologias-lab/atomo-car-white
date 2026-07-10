import { describe, expect, it } from "vitest";
import {
  formatBRL,
  formatKm,
  formatYear,
  formatPhone,
  maskPhoneBR,
  transmissionLabel,
  fuelLabel,
  statusLabel,
} from "../format";

describe("format", () => {
  it("formats BRL without decimals", () => {
    expect(formatBRL(120000)).toMatch(/R\$\s?120\.000/);
  });

  it("formats km in pt-BR", () => {
    expect(formatKm(45230)).toBe("45.230 km");
  });

  it("formats year as manufacture/model", () => {
    expect(formatYear(2022, 2023)).toBe("2022/2023");
  });

  it("formats 13-digit BR phone", () => {
    expect(formatPhone("5547999998888")).toBe("+55 (47) 99999-8888");
  });

  it("returns raw phone when length unexpected", () => {
    expect(formatPhone("123")).toBe("123");
  });

  it("masks BR phone progressively while typing", () => {
    expect(maskPhoneBR("")).toBe("");
    expect(maskPhoneBR("47")).toBe("(47");
    expect(maskPhoneBR("4799")).toBe("(47) 99");
    expect(maskPhoneBR("479999")).toBe("(47) 9999");
    expect(maskPhoneBR("4799999")).toBe("(47) 9999-9"); // fixo 10 dígitos
    expect(maskPhoneBR("47999998888")).toBe("(47) 99999-8888"); // celular 11 dígitos
    expect(maskPhoneBR("(47) 99999-8888")).toBe("(47) 99999-8888"); // idempotente
    expect(maskPhoneBR("479999988889999")).toBe("(47) 99999-8888"); // trunca em 11
  });

  it("translates transmission, fuel and status labels", () => {
    expect(transmissionLabel("automatic")).toBe("Automático");
    expect(transmissionLabel("unknown")).toBe("unknown");
    expect(fuelLabel("flex")).toBe("Flex");
    expect(statusLabel("reserved")).toBe("Reservado");
  });
});
