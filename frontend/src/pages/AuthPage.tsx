import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginApi, registerApi } from "@/lib/api";

const emailSchema = z.string().trim().email("Ingresá un email válido").max(255);
const passwordSchema = z.string().min(6, "La contraseña debe tener al menos 6 caracteres");
const nameSchema = z.string().trim().min(2, "Ingresá tu nombre").max(80);

type Mode = "login" | "registro" | "recuperar";

export function AuthPage() {
  const navigate = useNavigate();
  const { user, loading, login: authLogin } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    // Check search params for initial mode
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("modo") as Mode;
    if (modeParam && ["login", "registro", "recuperar"].includes(modeParam)) {
      setMode(modeParam);
    }
  }, []);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/", replace: true });
  }, [loading, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setSent(null);
    try {
      const parsedEmail = emailSchema.safeParse(email);
      if (!parsedEmail.success) throw new Error(parsedEmail.error.issues[0]!.message);

      if (mode === "recuperar") {
        toast.info("Funcionalidad disponible próximamente");
        setBusy(false);
        return;
      }

      const parsedPassword = passwordSchema.safeParse(password);
      if (!parsedPassword.success)
        throw new Error(parsedPassword.error.issues[0]!.message);

      if (mode === "registro") {
        const parsedName = nameSchema.safeParse(fullName);
        if (!parsedName.success) throw new Error(parsedName.error.issues[0]!.message);
        
        const response = await registerApi(parsedName.data, parsedEmail.data, parsedPassword.data);
        authLogin(response.token, response.user as any);
        toast.success("¡Cuenta creada!");
        navigate({ to: "/" });
        return;
      }

      const response = await loginApi(parsedEmail.data, parsedPassword.data);
      authLogin(response.token, response.user as any);
      toast.success("¡Bienvenida de nuevo!");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ocurrió un error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-md px-4 py-16">
        <p className="eyebrow text-center">Maki's Accesorios</p>
        <h1 className="mt-3 text-center text-3xl">
          {mode === "login" && "Iniciar sesión"}
          {mode === "registro" && "Crear cuenta"}
          {mode === "recuperar" && "Recuperar contraseña"}
        </h1>

        {sent && (
          <p className="mt-6 border border-sand bg-sand-light p-4 text-sm">{sent}</p>
        )}

        <form onSubmit={submit} className="mt-8 space-y-4">
          {mode === "registro" && (
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre y apellido</Label>
              <Input
                id="nombre"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={80}
                autoComplete="name"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              autoComplete="email"
            />
          </div>

          {mode !== "recuperar" && (
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {mode === "login" && "Ingresar"}
            {mode === "registro" && "Crear cuenta"}
            {mode === "recuperar" && "Enviar enlace"}
          </Button>
        </form>

        <div className="mt-8 space-y-2 text-center text-sm text-muted-foreground">
          {mode === "login" && (
            <>
              <p>
                <button
                  type="button"
                  className="underline hover:text-foreground"
                  onClick={() => setMode("recuperar")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </p>
              <p>
                ¿No tenés cuenta?{" "}
                <button
                  type="button"
                  className="underline hover:text-foreground"
                  onClick={() => setMode("registro")}
                >
                  Registrate
                </button>
              </p>
            </>
          )}
          {mode !== "login" && (
            <p>
              <button
                type="button"
                className="underline hover:text-foreground"
                onClick={() => setMode("login")}
              >
                Volver a iniciar sesión
              </button>
            </p>
          )}
          <p>
            <Link to="/" className="underline hover:text-foreground">
              Seguir comprando
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
