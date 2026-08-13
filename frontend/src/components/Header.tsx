import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingBag, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';

export function Header() {
  const { count } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate({ to: '/auth' });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <span className="font-display text-2xl tracking-wide">Maki's</span>
        </Link>

        <nav className="hidden items-center gap-8 text-xs uppercase tracking-[0.18em] md:flex">
          <Link to="/" className="transition-colors hover:text-sand-dark">Tienda</Link>
          <Link to="/carrito" className="transition-colors hover:text-sand-dark">Carrito</Link>
          {isAdmin && (
            <Link to="/admin" className="transition-colors hover:text-sand-dark">Panel</Link>
          )}
        </nav>

        <div className="flex items-center gap-1">
          {isAdmin && (
            <Button asChild variant="ghost" size="icon" className="md:hidden">
              <Link to="/admin" aria-label="Panel de administrador">
                <LayoutDashboard className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <Button asChild variant="ghost" size="icon">
            <Link to="/carrito" aria-label="Ver carrito" className="relative">
              <ShoppingBag className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-accent-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>
          {user ? (
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Cerrar sesión">
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Button asChild variant="ghost" size="icon">
              <Link to="/auth" aria-label="Iniciar sesión"><User className="h-4 w-4" /></Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
