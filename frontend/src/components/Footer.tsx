import { Link } from '@tanstack/react-router';
import { Mail, Truck, ShieldCheck } from 'lucide-react';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-sand-light">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="text-2xl">Maki's Accesorios</h3>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Bijouterie elegante y accesible. Trabajamos con acero quirúrgico, plata y
            baños de oro para que cada pieza acompañe tu día a día sin perder brillo.
          </p>
        </div>
        <div>
          <p className="eyebrow">Tienda</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/" className="text-muted-foreground hover:text-foreground">Todos los productos</Link></li>
            <li><Link to="/carrito" className="text-muted-foreground hover:text-foreground">Mi carrito</Link></li>
            <li><Link to="/auth" className="text-muted-foreground hover:text-foreground">Mi cuenta</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Información</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-sand-dark" /> Envíos a todo el país</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-sand-dark" /> Garantía de 30 días</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-sand-dark" /> makisaccesorios@gmail.com</li>
            <li className="flex items-center gap-2"><InstagramIcon className="h-4 w-4 text-sand-dark" /> @makis.acc</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Maki's Accesorios. Todos los derechos reservados.
      </div>
    </footer>
  );
}
