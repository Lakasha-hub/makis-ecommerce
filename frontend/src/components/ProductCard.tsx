import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { CATEGORY_LABELS, MATERIAL_LABELS, PLACEHOLDER_IMAGE, formatPrice, type Product } from '@/lib/catalog';

export function ProductCard({ product }: { product: Product }) {
  const { add, items } = useCart();
  const variants = product.variants ?? [];
  const inStock = variants.filter((v) => v.stock > 0);
  const first = inStock[0];

  const quickAdd = () => {
    if (!first) { toast.error('Sin stock disponible'); return; }

    // Verificar si ya se llegó al máximo de stock en el carrito
    const inCart = items.find((i) => i.variantId === first._id);
    if (inCart && inCart.qty >= first.stock) {
      toast.warning(`Ya tenés el máximo disponible de "${product.title}" en el carrito (${first.stock} unid.)`);
      return;
    }

    add({
      productId: product._id,
      variantId: first._id,
      title: product.title,
      spec: `${first.specificationLabel}: ${first.specificationValue}`,
      price: first.price ?? product.price,
      image: product.images?.[0] ?? null,
      stock: first.stock,
    });
    toast.success(`${product.title} agregado al carrito`);
  };

  return (
    <article className="group">
      <Link to="/producto/$id" params={{ id: product._id }} className="block overflow-hidden bg-sand-light">
        <img
          src={product.images?.[0] ?? PLACEHOLDER_IMAGE}
          alt={product.title}
          loading="lazy"
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{CATEGORY_LABELS[product.category]} · {MATERIAL_LABELS[product.material]}</p>
          <h3 className="mt-1 truncate text-lg">
            <Link to="/producto/$id" params={{ id: product._id }}>{product.title}</Link>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{formatPrice(product.price)}</p>
        </div>
        <Button size="icon" variant="outline" onClick={quickAdd} disabled={!first} aria-label={`Agregar ${product.title} al carrito`}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}
