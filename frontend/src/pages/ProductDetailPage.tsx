import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { getProduct } from "@/lib/api";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import {
  CATEGORY_LABELS,
  MATERIAL_LABELS,
  PLACEHOLDER_IMAGE,
  formatPrice,
} from "@/lib/catalog";

export function ProductDetailPage() {
  const { id } = useParams({ from: '/producto/$id' });
  const { add } = useCart();
  const [imageIndex, setImageIndex] = useState(0);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
  });

  const variants = product?.variants ?? [];
  const [variantId, setVariantId] = useState<string | null>(null);

  // Initialize variantId when variants load
  if (product && variantId === null && variants.length > 0) {
    setVariantId(variants.find((v) => v.stock > 0)?._id ?? variants[0]?._id ?? "");
  }

  if (isLoading) {
    return (
      <Layout>
        <p className="py-24 text-center text-sm text-muted-foreground">
          Cargando producto...
        </p>
      </Layout>
    );
  }

  if (isError || !product) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="text-3xl">Producto no encontrado</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Puede que ya no esté disponible.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Volver a la tienda</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const variant = variants.find((v) => v._id === variantId);
  const price = variant?.price ?? product.price;

  const addToCart = () => {
    if (!variant || variant.stock <= 0) {
      toast.error("Esta variante no tiene stock");
      return;
    }
    add({
      productId: product._id,
      variantId: variant._id,
      title: product.title,
      spec: `${variant.specificationLabel}: ${variant.specificationValue}`,
      price,
      image: product.images?.[0] ?? null,
      stock: variant.stock,
    });
    toast.success("Agregado al carrito");
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3 w-3" /> Tienda
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div>
            <div className="overflow-hidden bg-sand-light">
              <img
                src={product.images?.[imageIndex] ?? PLACEHOLDER_IMAGE}
                alt={product.title}
                width={900}
                height={900}
                className="aspect-square w-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="mt-3 flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setImageIndex(i)}
                    className={`h-16 w-16 overflow-hidden border ${
                      i === imageIndex ? "border-foreground" : "border-border"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${i + 1}`}
                      width={64}
                      height={64}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="eyebrow">
              {CATEGORY_LABELS[product.category]} · {MATERIAL_LABELS[product.material]}
            </p>
            <h1 className="mt-2 text-4xl">{product.title}</h1>
            <p className="mt-3 text-2xl">{formatPrice(price)}</p>
            {product.sku && (
              <p className="mt-1 text-xs text-muted-foreground">Código: {product.sku}</p>
            )}

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {variants.length > 0 && (
              <div className="mt-8">
                <p className="eyebrow">{variants[0]!.specificationLabel}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const selected = v._id === variantId;
                    return (
                      <button
                        key={v._id}
                        type="button"
                        disabled={v.stock <= 0}
                        onClick={() => setVariantId(v._id)}
                        className={`min-w-16 border px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                          selected
                            ? "border-foreground bg-foreground text-background"
                            : "border-border hover:border-sand"
                        }`}
                      >
                        {v.specificationValue}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {variant && variant.stock > 0
                    ? `${variant.stock} unidades disponibles`
                    : "Sin stock en esta variante"}
                </p>
              </div>
            )}

            <Button
              className="mt-8 w-full md:w-auto"
              size="lg"
              onClick={addToCart}
              disabled={!variant || variant.stock <= 0}
            >
              Agregar al carrito
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
