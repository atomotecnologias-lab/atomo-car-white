export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function vehicleSlug(parts: {
  brand: string;
  model: string;
  version: string;
  yearModel: number;
  id: string;
}): string {
  return slugify(
    `${parts.brand}-${parts.model}-${parts.version}-${parts.yearModel}-${parts.id}`,
  );
}
