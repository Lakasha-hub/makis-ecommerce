import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { CATEGORY_LABELS, MATERIAL_LABELS, PLACEHOLDER_IMAGE, formatPrice, type Product } from '@/lib/catalog';

export function ProductCard({ product }: { product: Product }) {
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
        <Link
          to="/producto/$id"
          params={{ id: product._id }}
          aria-label={`Ver más sobre ${product.title}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

