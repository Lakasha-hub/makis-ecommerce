import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { PLACEHOLDER_IMAGE, formatPrice } from "@/lib/catalog";

export function CartPage() {
  const { items, total, remove, setQty, clear } = useCart();
  const { user } = useAuth();

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-4xl">Tu carrito</h1>

        {!user && (
          <div className="mt-6 border border-sand bg-sand-light p-5">
            <p className="text-sm font-medium">¿Ya tenías una cuenta en Maki's?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Iniciá sesión para guardar tus datos y seguir tus pedidos más fácil.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to="/auth">Iniciar sesión</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/auth" search={{ modo: "registro" }}>
                  Crear cuenta
                </Link>
              </Button>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>
            <Button asChild className="mt-6">
              <Link to="/">Ver productos</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
            <ul className="divide-y divide-border border-y border-border">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-5">
                  <Link to="/producto/$id" params={{ id: item.productId }}>
                    <img
                      src={item.image ?? PLACEHOLDER_IMAGE}
                      alt={item.title}
                      width={96}
                      height={96}
                      loading="lazy"
                      className="h-24 w-24 bg-sand-light object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg leading-tight">
                          <Link to="/producto/$id" params={{ id: item.productId }}>
                            {item.title}
                          </Link>
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">{item.spec}</p>
                      </div>
                      <p className="whitespace-nowrap text-sm">
                        {formatPrice(item.price * item.qty)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          aria-label="Restar unidad"
                          className="px-2.5 py-1.5 hover:bg-secondary disabled:opacity-40"
                          disabled={item.qty <= 1}
                          onClick={() => setQty(item.variantId, item.qty - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-sm">{item.qty}</span>
                        <button
                          type="button"
                          aria-label="Sumar unidad"
                          className="px-2.5 py-1.5 hover:bg-secondary disabled:opacity-40"
                          disabled={item.qty >= item.stock}
                          onClick={() => setQty(item.variantId, item.qty + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.variantId)}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit border border-border p-6">
              <p className="eyebrow">Resumen</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span className="text-muted-foreground">A calcular</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Button
                asChild
                className="mt-6 w-full"
                size="lg"
              >
                <Link to="/checkout">Confirmar compra</Link>
              </Button>
              <Button variant="ghost" className="mt-2 w-full text-xs" onClick={clear}>
                Vaciar carrito
              </Button>
            </aside>
          </div>
        )}
      </div>
    </Layout>
  );
}
