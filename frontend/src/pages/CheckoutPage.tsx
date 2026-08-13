import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { formatPrice, PLACEHOLDER_IMAGE } from "@/lib/catalog";

interface ShippingAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

const emptyAddress: ShippingAddress = {
  street: "",
  city: "",
  postalCode: "",
  country: "Argentina",
};

export function CheckoutPage() {
  const { items, total } = useCart();
  const { user } = useAuth();
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [busy, setBusy] = useState(false);

  // Si no está logueado, redirigir al login
  if (!user) {
    return (
      <Layout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="text-3xl">Iniciá sesión para continuar</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Necesitás una cuenta para completar la compra.
          </p>
          <Button asChild className="mt-6">
            <Link to="/auth">Iniciar sesión</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="text-3xl">Tu carrito está vacío</h1>
          <Button asChild className="mt-6">
            <Link to="/">Ver productos</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const field = (
    id: keyof ShippingAddress,
    label: string,
    placeholder: string
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={address[id]}
        placeholder={placeholder}
        onChange={(e) => setAddress({ ...address, [id]: e.target.value })}
      />
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.street.trim() || !address.city.trim() || !address.postalCode.trim()) {
      toast.error("Completá todos los campos de envío");
      return;
    }
    setBusy(true);
    try {
      const res = await api.post<{ data: { initPoint: string } }>(
        "/api/payments/create-preference",
        { shippingAddress: address, items }
      );
      // Redirigir a la página de pago de Mercado Pago
      window.location.href = res.data.initPoint;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al iniciar el pago");
      setBusy(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <p className="eyebrow">Paso final</p>
        <h1 className="mt-2 text-4xl">Checkout</h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
          {/* Formulario de envío */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-xl">Dirección de envío</h2>

            {field("street", "Calle y número", "Av. Corrientes 1234")}
            <div className="grid gap-4 sm:grid-cols-2">
              {field("city", "Ciudad", "Buenos Aires")}
              {field("postalCode", "Código postal", "C1043")}
            </div>
            {field("country", "País", "Argentina")}

            <Button
              type="submit"
              size="lg"
              className="mt-4 w-full"
              disabled={busy}
            >
              {busy ? "Redirigiendo a Mercado Pago…" : "Pagar con Mercado Pago"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Serás redirigido al sitio seguro de Mercado Pago para completar el pago.
            </p>
          </form>

          {/* Resumen del pedido */}
          <aside className="h-fit border border-border p-6">
            <p className="eyebrow">Tu pedido</p>
            <ul className="mt-4 divide-y divide-border">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-3 py-3">
                  <img
                    src={item.image ?? PLACEHOLDER_IMAGE}
                    alt={item.title}
                    className="h-14 w-14 bg-sand-light object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.spec}</p>
                    <p className="text-xs text-muted-foreground">x{item.qty}</p>
                  </div>
                  <p className="shrink-0 text-sm">{formatPrice(item.price * item.qty)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-lg font-medium">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
