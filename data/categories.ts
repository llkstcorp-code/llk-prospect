import type { Category, CategoryId } from "@/types";

export const CATEGORIES: Category[] = [
  { id: "restaurante", label: "Restaurantes", singular: "Restaurante" },
  { id: "pizzaria", label: "Pizzarias", singular: "Pizzaria" },
  { id: "pousada", label: "Pousadas", singular: "Pousada" },
  { id: "hotel", label: "Hotéis", singular: "Hotel" },
  { id: "academia", label: "Academias", singular: "Academia" },
  { id: "clinica", label: "Clínicas", singular: "Clínica" },
  { id: "dentista", label: "Dentistas", singular: "Dentista" },
  { id: "imobiliaria", label: "Imobiliárias", singular: "Imobiliária" },
  { id: "loja", label: "Lojas", singular: "Loja" },
  { id: "oficina", label: "Oficinas", singular: "Oficina" },
  {
    id: "construcao",
    label: "Empresas de construção",
    singular: "Construção",
  },
  {
    id: "prestador",
    label: "Prestadores de serviço",
    singular: "Prestador de serviço",
  },
  { id: "outros", label: "Outros", singular: "Outros" },
];

const CATEGORY_BY_ID = new Map<CategoryId, Category>(
  CATEGORIES.map((category) => [category.id, category])
);

export function getCategory(id: CategoryId): Category | undefined {
  return CATEGORY_BY_ID.get(id);
}

export function getCategoryLabel(id: CategoryId): string {
  return CATEGORY_BY_ID.get(id)?.singular ?? "Outros";
}
