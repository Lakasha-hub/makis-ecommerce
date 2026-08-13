import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, listProducts } from "@/lib/api";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_SPEC_LABEL,
  MATERIALS,
  MATERIAL_LABELS,
  PLACEHOLDER_IMAGE,
  formatPrice,
  type Category,
  type Material,
  type Product,
} from "@/lib/catalog";

interface VariantDraft {
  _id?: string;
  sku: string;
  specificationLabel: string;
  specificationValue: string;
  stock: string;
  price: string;
}

interface FormState {
  _id: string | null;
  sku: string;
  title: string;
  description: string;
  price: string;
  category: Category;
  material: Material;
  images: string;
  isActive: boolean;
  variants: VariantDraft[];
}

const makeEmptyVariant = (category: Category): VariantDraft => ({
  sku: "",
  specificationLabel: CATEGORY_SPEC_LABEL[category],
  specificationValue: "",
  stock: "0",
  price: "",
});

const DEFAULT_CATEGORY: Category = "anillo";

const emptyForm: FormState = {
  _id: null,
  sku: "",
  title: "",
  description: "",
  price: "",
  category: DEFAULT_CATEGORY,
  material: "acero_dorado",
  images: "",
  isActive: true,
  variants: [makeEmptyVariant(DEFAULT_CATEGORY)],
};

export function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [open, setOpen] = useState(false);

  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: listProducts,
    enabled: isAdmin,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const save = useMutation({
    mutationFn: async (state: FormState) => {
      const price = Number(state.price);
      if (!state.title.trim()) throw new Error("El título es obligatorio");
      if (!state.description.trim()) throw new Error("La descripción es obligatoria");
      if (!Number.isFinite(price) || price < 0) throw new Error("Precio inválido");
      const images = state.images
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (images.length === 0) throw new Error("Agregá al menos una imagen");
      const variants = state.variants.filter(
        (v) => v.specificationLabel.trim() && v.specificationValue.trim(),
      );
      if (variants.length === 0) throw new Error("Agregá al menos una variante");
      const zeroStock = variants.find((v) => Number(v.stock) <= 0);
      if (zeroStock) throw new Error(`La variante "${zeroStock.specificationValue}" debe tener stock mayor a 0`);

      const payload = {
        sku: state.sku.trim() || undefined,
        title: state.title.trim(),
        description: state.description.trim(),
        price,
        category: state.category,
        material: state.material,
        images,
        isActive: state.isActive,
        variants: variants.map((v) => ({
          sku: v.sku.trim() || undefined,
          specificationLabel: v.specificationLabel.trim(),
          specificationValue: v.specificationValue.trim(),
          stock: Math.max(0, Number(v.stock) || 0),
          price: v.price.trim() ? Number(v.price) : undefined,
        }))
      };

      if (state._id) {
        await api.put(`/api/products/${state._id}`, payload);
      } else {
        await api.post(`/api/products`, payload);
      }
    },
    onSuccess: () => {
      toast.success("Producto guardado");
      setForm(emptyForm);
      setOpen(false);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/products/${id}`);
    },
    onSuccess: () => {
      toast.success("Producto eliminado");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const edit = (product: Product) => {
    setForm({
      _id: product._id,
      sku: product.sku ?? "",
      title: product.title,
      description: product.description,
      price: String(product.price),
      category: product.category,
      material: product.material,
      images: (product.images ?? []).join("\n"),
      isActive: product.isActive,
      variants: (product.variants ?? []).map((v) => ({
        _id: v._id,
        sku: v.sku ?? "",
        specificationLabel: v.specificationLabel,
        specificationValue: v.specificationValue,
        stock: String(v.stock),
        price: v.price != null ? String(v.price) : "",
      })),
    });
    setOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <Layout>
        <p className="py-24 text-center text-sm text-muted-foreground">Cargando…</p>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="text-3xl">Acceso restringido</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Tu cuenta no tiene permisos de administrador.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Volver a la tienda</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Administración</p>
            <h1 className="mt-2 text-4xl">Catálogo</h1>
          </div>
          <Button
            onClick={() => {
              setForm(emptyForm);
              setOpen((v) => !v);
            }}
          >
            {open ? (
              <>
                <X className="mr-2 h-4 w-4" /> Cerrar
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Nuevo producto
              </>
            )}
          </Button>
        </div>

        {open && (
          <form
            className="mt-8 space-y-5 border border-border p-6"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate(form);
            }}
          >
            <h2 className="text-2xl">
              {form._id ? "Editar producto" : "Nuevo producto"}
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={form.title}
                  maxLength={120}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">Código (SKU)</Label>
                <Input
                  id="sku"
                  value={form.sku}
                  maxLength={40}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Descripción</Label>
              <Textarea
                id="desc"
                value={form.description}
                maxLength={1000}
                rows={3}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <select
                  id="category"
                  className="h-9 w-full border border-input bg-background px-3 text-sm"
                  value={form.category}
                  onChange={(e) => {
                    const newCategory = e.target.value as Category;
                    const newLabel = CATEGORY_SPEC_LABEL[newCategory];
                    setForm({
                      ...form,
                      category: newCategory,
                      variants: form.variants.map((v) => ({
                        ...v,
                        specificationLabel: newLabel,
                      })),
                    });
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <select
                  id="material"
                  className="h-9 w-full border border-input bg-background px-3 text-sm"
                  value={form.material}
                  onChange={(e) =>
                    setForm({ ...form, material: e.target.value as Material })
                  }
                >
                  {MATERIALS.map((m) => (
                    <option key={m} value={m}>
                      {MATERIAL_LABELS[m]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Imágenes (una URL por línea)</Label>
              <Textarea
                id="images"
                value={form.images}
                rows={2}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Producto visible en la tienda
            </label>

            <div className="space-y-3 border-t border-border pt-5">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Variantes</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm({ ...form, variants: [...form.variants, makeEmptyVariant(form.category)] })
                  }
                >
                  <Plus className="mr-1 h-3 w-3" /> Agregar
                </Button>
              </div>

              {/* Encabezados de columna — solo se muestran si hay al menos una variante */}
              {form.variants.length > 0 && (
                <div className="grid gap-2 md:grid-cols-[1fr_1fr_90px_110px_40px] px-0">
                  <span className="text-xs text-muted-foreground">Atributo</span>
                  <span className="text-xs text-muted-foreground">Valor</span>
                  <span className="text-xs text-muted-foreground">Stock *</span>
                  <span className="text-xs text-muted-foreground">Precio opc.</span>
                  <span />
                </div>
              )}

              {form.variants.map((variant, index) => (
                <div key={index} className="grid gap-2 md:grid-cols-[1fr_1fr_90px_110px_40px] items-center">
                  {/* Etiqueta del atributo — solo lectura */}
                  <div
                    className="flex h-9 items-center border border-input bg-muted px-3 text-sm text-muted-foreground select-none cursor-not-allowed"
                    title="El nombre del atributo no puede modificarse"
                  >
                    {variant.specificationLabel}
                  </div>
                  <Input
                    placeholder="Valor (16)"
                    value={variant.specificationValue}
                    onChange={(e) => {
                      const next = [...form.variants];
                      next[index] = { ...variant, specificationValue: e.target.value };
                      setForm({ ...form, variants: next });
                    }}
                  />
                  <Input
                    type="number"
                    min="1"
                    placeholder="0"
                    value={variant.stock}
                    onChange={(e) => {
                      const next = [...form.variants];
                      next[index] = { ...variant, stock: e.target.value };
                      setForm({ ...form, variants: next });
                    }}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="—"
                    value={variant.price}
                    onChange={(e) => {
                      const next = [...form.variants];
                      next[index] = { ...variant, price: e.target.value };
                      setForm({ ...form, variants: next });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Quitar variante"
                    onClick={() =>
                      setForm({
                        ...form,
                        variants: form.variants.filter((_, i) => i !== index),
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button type="submit" size="lg" disabled={save.isPending}>
              {save.isPending ? "Guardando…" : "Guardar producto"}
            </Button>
          </form>
        )}

        <div className="mt-12 space-y-4">
          {productsQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Cargando productos…</p>
          )}
          {(productsQuery.data ?? []).map((product) => (
            <div
              key={product._id}
              className="flex flex-wrap items-center gap-4 border border-border p-4"
            >
              <img
                src={product.images?.[0] ?? PLACEHOLDER_IMAGE}
                alt={product.title}
                width={64}
                height={64}
                loading="lazy"
                className="h-16 w-16 bg-sand-light object-cover"
              />
              <div className="min-w-40 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-lg">{product.title}</p>
                  {!product.isActive && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      No visible
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {CATEGORY_LABELS[product.category]} ·{" "}
                  {MATERIAL_LABELS[product.material]} · {formatPrice(product.price)} ·{" "}
                  {(product.variants ?? []).length} variantes
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => edit(product)}>
                  <Pencil className="mr-1 h-3 w-3" /> Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`¿Eliminar "${product.title}"?`))
                      remove.mutate(product._id);
                  }}
                >
                  <Trash2 className="mr-1 h-3 w-3" /> Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
