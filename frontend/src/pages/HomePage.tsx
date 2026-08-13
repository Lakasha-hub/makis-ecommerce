import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { listProducts } from "@/lib/api";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  MATERIALS,
  MATERIAL_LABELS,
  type Category,
  type Material,
} from "@/lib/catalog";

export function HomePage() {
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "todas">("todas");
  const [material, setMaterial] = useState<Material | "todos">("todos");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchQ =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q);
      const matchC = category === "todas" || p.category === category;
      const matchM = material === "todos" || p.material === material;
      return matchQ && matchC && matchM;
    });
  }, [products, search, category, material]);

  const hasFilters = category !== "todas" || material !== "todos" || search !== "";

  if (isError) {
    return (
      <Layout>
        <p className="py-24 text-center text-sm text-muted-foreground">
          No pudimos cargar los productos. Intentá recargar la página.
        </p>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="border-b border-border bg-sand-light">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <p className="eyebrow">Bijouterie · Argentina</p>
          <h1 className="mx-auto mt-4 max-w-2xl text-4xl leading-tight md:text-6xl">
            Piezas que acompañan todos los días
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Acero quirúrgico, plata 925 y baños de oro. Diseños simples, resistentes al
            agua y pensados para usar siempre.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, descripción o código"
              className="pl-9"
              aria-label="Buscar productos"
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow mr-1">Categoría</span>
              <FilterChip
                active={category === "todas"}
                onClick={() => setCategory("todas")}
                label="Todas"
              />
              {CATEGORIES.map((c) => (
                <FilterChip
                  key={c}
                  active={category === c}
                  onClick={() => setCategory(c)}
                  label={CATEGORY_LABELS[c]}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow mr-1">Material</span>
              <FilterChip
                active={material === "todos"}
                onClick={() => setMaterial("todos")}
                label="Todos"
              />
              {MATERIALS.map((m) => (
                <FilterChip
                  key={m}
                  active={material === m}
                  onClick={() => setMaterial(m)}
                  label={MATERIAL_LABELS[m]}
                />
              ))}
            </div>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setSearch("");
                  setCategory("todas");
                  setMaterial("todos");
                }}
              >
                <X className="mr-1 h-3 w-3" /> Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
        </p>

        {isLoading ? (
          <p className="py-20 text-center text-sm text-muted-foreground">
            Cargando productos...
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">
            No encontramos productos con esos filtros.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-muted-foreground hover:border-sand hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
