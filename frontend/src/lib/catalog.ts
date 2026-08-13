export const CATEGORIES = ['anillo','arito','collar','pulsera','accesorio'] as const;
export const MATERIALS = ['fantasia','acero_quirurgico','acero_dorado','acero_rosado','acero_blanco','plata','oro','bronce_plateado','bronce'] as const;
export type Category = (typeof CATEGORIES)[number];
export type Material = (typeof MATERIALS)[number];
export const CATEGORY_LABELS: Record<Category, string> = {
  anillo: 'Anillos', arito: 'Aritos', collar: 'Collares', pulsera: 'Pulseras', accesorio: 'Accesorios',
};
export const MATERIAL_LABELS: Record<Material, string> = {
  fantasia: 'Fantasía', acero_quirurgico: 'Acero quirúrgico', acero_dorado: 'Acero dorado',
  acero_rosado: 'Acero rosado', acero_blanco: 'Acero blanco', plata: 'Plata', oro: 'Oro',
  bronce_plateado: 'Bronce plateado', bronce: 'Bronce',
};
/** Nombre del atributo de variante que corresponde a cada categoría. */
export const CATEGORY_SPEC_LABEL: Record<Category, string> = {
  anillo:    'Talle',
  arito:     'Tipo',
  collar:    'Largo',
  pulsera:   'Talle',
  accesorio: 'Talle',
};
export interface Variant {
  _id: string;
  sku?: string;
  specificationLabel: string;
  specificationValue: string;
  stock: number;
  price?: number;
}
export interface Product {
  _id: string;
  sku?: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  material: Material;
  images: string[];
  isActive: boolean;
  variants: Variant[];
  totalStock?: number;
}
export const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23f3ece4"/></svg>`);
