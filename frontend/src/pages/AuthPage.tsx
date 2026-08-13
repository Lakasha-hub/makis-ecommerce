import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginApi, registerApi, forgotPasswordApi, resetPasswordApi } from "@/lib/api";

const emailSchema = z.string().trim().email("Ingresá un email válido").max(255);
const passwordSchema = z.string().min(6, "La contraseña debe tener al menos 6 caracteres");
const nameSchema = z.string().trim().min(2, "Ingresá tu nombre").max(80);

type Mode = "login" | "registro" | "recuperar" | "reset";

export function AuthPage() {
  const navigate = useNavigate();
  const { user, loading, login: authLogin } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("modo") as Mode;
    const tokenParam = params.get("token");

    if (tokenParam) {
      setResetToken(tokenParam);
      setMode("reset");
    } else if (modeParam && ["login", "registro", "recuperar"].includes(modeParam)) {
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
      // ── Recuperar contraseña ──────────────────────────────────
      if (mode === "recuperar") {
        const parsedEmail = emailSchema.safeParse(email);
        if (!parsedEmail.success) throw new Error(parsedEmail.error.issues[0]!.message);
        await forgotPasswordApi(parsedEmail.data);
        setSent("Si tu email está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.");
        return;
      }

      // ── Restablecer contraseña (desde el link del email) ──────
      if (mode === "reset") {
        const parsedPassword = passwordSchema.safeParse(password);
        if (!parsedPassword.success) throw new Error(parsedPassword.error.issues[0]!.message);
        if (!resetToken) throw new Error("Token inválido");
        await resetPasswordApi(resetToken, parsedPassword.data);
        toast.success("¡Contraseña actualizada! Ya podés iniciar sesión.");
        setMode("login");
        setPassword("");
        setResetToken(null);
        window.history.replaceState({}, "", "/auth");
        return;
      }

      // ── Login / Registro ──────────────────────────────────────
      const parsedEmail = emailSchema.safeParse(email);
      if (!parsedEmail.success) throw new Error(parsedEmail.error.issues[0]!.message);

      const parsedPassword = passwordSchema.safeParse(password);
      if (!parsedPassword.success) throw new Error(parsedPassword.error.issues[0]!.message);

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
          {mode === "reset" && "Nueva contraseña"}
        </h1>

        {sent && (
          <p className="mt-6 border border-sand bg-sand-light p-4 text-sm">{sent}</p>
        )}

        {!sent && (
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

            {(mode === "login" || mode === "registro" || mode === "recuperar") && (
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
            )}

            {(mode === "login" || mode === "registro" || mode === "reset") && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  {mode === "reset" ? "Nueva contraseña" : "Contraseña"}
                </Label>
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
              {mode === "recuperar" && (busy ? "Enviando…" : "Enviar enlace")}
              {mode === "reset" && (busy ? "Guardando…" : "Guardar contraseña")}
            </Button>
          </form>
        )}

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
                onClick={() => {
                  setMode("login");
                  setSent(null);
                }}
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


