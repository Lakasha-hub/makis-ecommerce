import { Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

type ResultType = "exitoso" | "pendiente" | "fallido";

const config: Record<
  ResultType,
  { icon: React.ReactNode; title: string; description: string; color: string }
> = {
  exitoso: {
    icon: <CheckCircle2 className="h-16 w-16 text-green-600" />,
    title: "¡Pago aprobado!",
    description:
      "Tu compra fue procesada correctamente. En breve recibirás un email con el detalle de tu pedido.",
    color: "text-green-700",
  },
  pendiente: {
    icon: <Clock className="h-16 w-16 text-yellow-500" />,
    title: "Pago pendiente",
    description:
      "Tu pago está siendo procesado. Te notificaremos por email cuando se acredite.",
    color: "text-yellow-700",
  },
  fallido: {
    icon: <XCircle className="h-16 w-16 text-red-500" />,
    title: "Pago no completado",
    description:
      "Hubo un problema con el pago. Podés intentarlo de nuevo o elegir otro medio de pago.",
    color: "text-red-700",
  },
};

export function PaymentResultPage({ result }: { result: ResultType }) {
  const { clear } = useCart();
  const { title, description, icon, color } = config[result];

  // Vaciar el carrito local solo si el pago fue exitoso.
  // El stock y la order ya se crean via webhook, pero limpiamos el carrito local
  // para no confundir al usuario.
  useEffect(() => {
    if (result === "exitoso") {
      clear();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout>
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="flex justify-center">{icon}</div>
        <h1 className={`mt-6 text-3xl ${color}`}>{title}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{description}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to="/">Seguir comprando</Link>
          </Button>
          {result === "fallido" && (
            <Button asChild variant="outline">
              <Link to="/carrito">Volver al carrito</Link>
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
