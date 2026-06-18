import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getServerConfig } from "../config.server";
import type { PlateLookupResult } from "../plate-lookup";

// apiplacas.com.br expõe o /api.php atrás de Cloudflare (bloqueia bots).
// O backend real para integração é wdapi2.com.br, sem challenge:
//   GET https://wdapi2.com.br/consulta/{PLACA}/{TOKEN}
const API_BASE = "https://wdapi2.com.br/consulta";

export const lookupPlateServer = createServerFn({ method: "POST" })
  .inputValidator(z.object({ plate: z.string().min(7).max(8) }))
  .handler(async ({ data }): Promise<PlateLookupResult> => {
    const { plateApiToken } = getServerConfig();
    if (!plateApiToken) throw new Error("Token da API de placas não configurado.");

    const plate = data.plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const url = `${API_BASE}/${plate}/${plateApiToken}`;

    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) throw new Error(`Consulta indisponível (${res.status})`);

    const json = (await res.json()) as Record<string, unknown>;

    // Erro lógico da API (placa não encontrada, token inválido, etc.)
    if (json.error || json.erro || json.message === "error") {
      throw new Error(
        String(json.message ?? json.error ?? json.erro ?? "Placa não encontrada."),
      );
    }

    const lista = Array.isArray(json.listamodelo)
      ? (json.listamodelo as string[])
      : [];
    const modeloFull = String(json.modelo ?? "");

    // model = primeiro token da lista; version = restante
    const model = lista[0] ?? modeloFull;
    const version =
      lista.length > 1
        ? lista.slice(1).join(" ")
        : modeloFull.replace(new RegExp(`^${model}\\s*`, "i"), "");

    const yMfr = Number(json.ano) || new Date().getFullYear();
    const yMdl = Number(json.anoModelo) || yMfr;

    const fuelRaw = String(
      json.combustivel ?? (json.extra as Record<string, unknown>)?.combustivel ?? "",
    ).toUpperCase();
    const fuelMap: Record<string, PlateLookupResult["fuel"]> = {
      FLEX: "flex",
      "ÁLCOOL/GASOLINA": "flex",
      "ALCOOL/GASOLINA": "flex",
      GASOLINA: "gasoline",
      ALCOOL: "flex",
      ÁLCOOL: "flex",
      DIESEL: "diesel",
      "DIESEL/GAS NATURAL": "diesel",
      HIBRIDO: "hybrid",
      HÍBRIDO: "hybrid",
      ELETRICO: "electric",
      ELÉTRICO: "electric",
    };

    return {
      plate: data.plate,
      brand: titleCase(String(json.marca ?? "")),
      model: titleCase(model),
      version: version.trim(),
      yearManufacture: yMfr,
      yearModel: yMdl,
      color: titleCase(String(json.cor ?? "")),
      fuel: fuelMap[fuelRaw] ?? "flex",
    };
  });

function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
