export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(value)} DA`;
}

export function stockLabel(stock: number): string | null {
  if (stock <= 0) return "Out of stock";
  if (stock <= 3) return `Only ${stock} item${stock === 1 ? "" : "s"} left`;
  return null;
}

export const WILAYAS = [
  "Adrar",
  "Alger",
  "Annaba",
  "Batna",
  "Béchar",
  "Béjaïa",
  "Biskra",
  "Blida",
  "Bouira",
  "Constantine",
  "Djelfa",
  "El Oued",
  "Ghardaïa",
  "Jijel",
  "Laghouat",
  "Mostaganem",
  "Oran",
  "Ouargla",
  "Sétif",
  "Sidi Bel Abbès",
  "Skikda",
  "Tébessa",
  "Tiaret",
  "Tizi Ouzou",
  "Tlemcen",
] as const;

export const STORE = {
  name: "Maison Noir",
  tagline: "Curated essentials, delivered across Algeria.",
  phone: "+213 555 12 34 56",
  email: "orders@maisonnoir.store",
  hours: "Sat – Thu, 9:00 – 19:00",
};
