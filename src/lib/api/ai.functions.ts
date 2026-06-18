import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getServerConfig } from "../config.server";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };
type ChatMessage = { role: "system" | "user"; content: string | ContentPart[] };

async function callOpenAI(
  messages: ChatMessage[],
  opts?: { temperature?: number },
): Promise<Record<string, unknown>> {
  const { openaiApiKey, openaiModel } = getServerConfig();
  if (!openaiApiKey) throw new Error("Chave da OpenAI não configurada.");

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: openaiModel,
      messages,
      temperature: opts?.temperature ?? 0.5,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenAI indisponível (${res.status}). ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Resposta vazia da OpenAI.");

  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    throw new Error("Não foi possível interpretar a resposta da IA.");
  }
}

// ---------------------------------------------------------------------------
// 1. Enriquecimento da ficha técnica a partir de marca/modelo/versão
// ---------------------------------------------------------------------------

const TRANSMISSIONS = ["manual", "automatic", "cvt", "automated"] as const;
const FUELS = ["flex", "gasoline", "diesel", "hybrid", "electric"] as const;

export const enrichVehicleServer = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      brand: z.string().min(1),
      model: z.string().min(1),
      version: z.string().default(""),
      yearModel: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const json = await callOpenAI([
      {
        role: "system",
        content:
          "Você é um especialista em fichas técnicas de veículos vendidos no Brasil. " +
          "Receberá marca, modelo, versão (possivelmente abreviada, ex.: 'LGTD' = 'Longitude') e ano. " +
          "Responda APENAS um objeto JSON com as chaves exatas: " +
          '"version" (string: versão por extenso e completa), ' +
          '"transmission" (um de: manual, automatic, cvt, automated), ' +
          '"fuel" (um de: flex, gasoline, diesel, hybrid, electric), ' +
          '"doors" (número inteiro: 2 ou 4), ' +
          '"features" (array de 6 a 12 strings em português com os opcionais de fábrica típicos desta versão). ' +
          "Não invente itens improváveis. Se incerto, escolha o mais comum para a versão.",
      },
      {
        role: "user",
        content: `Marca: ${data.brand}\nModelo: ${data.model}\nVersão: ${data.version}\nAno: ${data.yearModel ?? "desconhecido"}`,
      },
    ]);

    const transmission = TRANSMISSIONS.includes(json.transmission as never)
      ? (json.transmission as (typeof TRANSMISSIONS)[number])
      : null;
    const fuel = FUELS.includes(json.fuel as never)
      ? (json.fuel as (typeof FUELS)[number])
      : null;
    const doorsNum = Number(json.doors);
    const features = Array.isArray(json.features)
      ? (json.features as unknown[]).map((f) => String(f)).filter(Boolean).slice(0, 12)
      : [];

    return {
      version: typeof json.version === "string" ? json.version : data.version,
      transmission,
      fuel,
      doors: doorsNum === 2 || doorsNum === 4 ? doorsNum : null,
      features,
    };
  });

// ---------------------------------------------------------------------------
// 2. Geração de descrições comerciais
// ---------------------------------------------------------------------------

export const generateContentServer = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      brand: z.string(),
      model: z.string(),
      version: z.string().default(""),
      yearModel: z.number().optional(),
      mileage: z.number().optional(),
      color: z.string().default(""),
      transmission: z.string().default(""),
      fuel: z.string().default(""),
      features: z.array(z.string()).default([]),
    }),
  )
  .handler(async ({ data }) => {
    const json = await callOpenAI([
      {
        role: "system",
        content:
          "Você é redator comercial de uma revenda de seminovos no Brasil. " +
          "Escreva um anúncio profissional, confiável e atrativo, sem exageros e sem inventar dados " +
          "(não cite preço, garantia específica nem condições que não foram informadas). " +
          "Responda APENAS um objeto JSON com as chaves: " +
          '"descriptionShort" (string de no máximo 180 caracteres, ideal para card/listagem) e ' +
          '"descriptionFull" (string com 2 a 4 parágrafos, separados por \\n\\n, destacando estado, ' +
          "opcionais e convite ao contato/visita). Tom português brasileiro.",
      },
      {
        role: "user",
        content: JSON.stringify({
          marca: data.brand,
          modelo: data.model,
          versao: data.version,
          ano: data.yearModel,
          km: data.mileage,
          cor: data.color,
          cambio: data.transmission,
          combustivel: data.fuel,
          opcionais: data.features,
        }),
      },
    ]);

    return {
      descriptionShort:
        typeof json.descriptionShort === "string"
          ? json.descriptionShort.slice(0, 180)
          : "",
      descriptionFull:
        typeof json.descriptionFull === "string" ? json.descriptionFull : "",
    };
  });

// ---------------------------------------------------------------------------
// 3. Sugestão de faixa de preço de mercado
// ---------------------------------------------------------------------------

export const suggestPriceServer = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      brand: z.string(),
      model: z.string(),
      version: z.string().default(""),
      yearModel: z.number().optional(),
      mileage: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const json = await callOpenAI([
      {
        role: "system",
        content:
          "Você é avaliador de veículos seminovos no Brasil. Estime uma faixa de preço de mercado " +
          "(em reais) para revenda, considerando marca, modelo, versão, ano e quilometragem. " +
          "Responda APENAS um objeto JSON com as chaves numéricas: " +
          '"min", "max" e "suggested" (valor central recomendado), todos em reais, sem texto.',
      },
      {
        role: "user",
        content: JSON.stringify({
          marca: data.brand,
          modelo: data.model,
          versao: data.version,
          ano: data.yearModel,
          km: data.mileage,
        }),
      },
    ]);

    const min = Math.round(Number(json.min) || 0);
    const max = Math.round(Number(json.max) || 0);
    const suggested = Math.round(Number(json.suggested) || Math.round((min + max) / 2));
    return { min, max, suggested };
  });

// ---------------------------------------------------------------------------
// 4. Leitura de placa por foto (visão)
// ---------------------------------------------------------------------------

const imageInput = z.object({
  imageBase64: z.string().startsWith("data:image/"),
});

export const readPlateServer = createServerFn({ method: "POST" })
  .inputValidator(imageInput)
  .handler(async ({ data }) => {
    const json = await callOpenAI(
      [
        {
          role: "system",
          content:
            "Você lê placas de veículos brasileiros (Mercosul no formato AAA0A00 ou antiga AAA0000). " +
            'Responda APENAS JSON {"plate":"..."} com os 7 caracteres da placa principal da imagem, ' +
            'em maiúsculas e sem traço. Se não conseguir ler com segurança, responda {"plate":""}.',
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Leia a placa desta imagem." },
            { type: "image_url", image_url: { url: data.imageBase64 } },
          ],
        },
      ],
      { temperature: 0 },
    );

    const plate = String(json.plate ?? "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 7);
    return { plate };
  });

// ---------------------------------------------------------------------------
// 5. Leitura de hodômetro por foto (visão)
// ---------------------------------------------------------------------------

export const readOdometerServer = createServerFn({ method: "POST" })
  .inputValidator(imageInput)
  .handler(async ({ data }) => {
    const json = await callOpenAI(
      [
        {
          role: "system",
          content:
            "Você lê o hodômetro (odômetro) do painel de um veículo. " +
            'Responda APENAS JSON {"mileage":0} com a quilometragem TOTAL em km como número inteiro, ' +
            "ignorando o hodômetro parcial/trip (geralmente menor, com casa decimal) e sem casas decimais. " +
            'Se não conseguir ler com segurança, responda {"mileage":0}.',
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Leia a quilometragem total do hodômetro nesta imagem." },
            { type: "image_url", image_url: { url: data.imageBase64 } },
          ],
        },
      ],
      { temperature: 0 },
    );

    const mileage = Math.max(0, Math.round(Number(json.mileage) || 0));
    return { mileage };
  });
