export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Moeda com centavos — obrigatório em telas financeiras. */
export function formatBRLExact(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Data ISO (yyyy-mm-dd) → dd/mm/aaaa, sem surpresas de fuso. */
export function formatDateBR(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function formatKm(km: number): string {
  return `${new Intl.NumberFormat("pt-BR").format(km)} km`;
}

export function formatYear(manufacture: number, model: number): string {
  return `${manufacture}/${model}`;
}

export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 13) {
    // 55 47 99999 9999
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  return raw;
}

export function transmissionLabel(t: string): string {
  switch (t) {
    case "automatic":
      return "Automático";
    case "manual":
      return "Manual";
    case "cvt":
      return "CVT";
    case "automated":
      return "Automatizado";
    default:
      return t;
  }
}

export function fuelLabel(f: string): string {
  switch (f) {
    case "flex":
      return "Flex";
    case "gasoline":
      return "Gasolina";
    case "diesel":
      return "Diesel";
    case "hybrid":
      return "Híbrido";
    case "electric":
      return "Elétrico";
    default:
      return f;
  }
}

export function statusLabel(s: string): string {
  switch (s) {
    case "active":
      return "Ativo";
    case "draft":
      return "Rascunho";
    case "awaiting_photos":
      return "Aguardando fotos";
    case "reserved":
      return "Reservado";
    case "sold":
      return "Vendido";
    case "inactive":
      return "Inativo";
    default:
      return s;
  }
}
