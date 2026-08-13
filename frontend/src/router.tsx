import { createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { HomePage } from '@/pages/HomePage';
import { AuthPage } from '@/pages/AuthPage';
import { CartPage } from '@/pages/CartPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { AdminPage } from '@/pages/AdminPage';

export const queryClient = new QueryClient();

const rootRoute = createRootRoute({ component: Outlet });

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });
const authRoute = createRoute({ getParentRoute: () => rootRoute, path: '/auth', component: AuthPage });
const carritoRoute = createRoute({ getParentRoute: () => rootRoute, path: '/carrito', component: CartPage });
const productoRoute = createRoute({ getParentRoute: () => rootRoute, path: '/producto/$id', component: ProductDetailPage });
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
  beforeLoad: () => {
    const user = localStorage.getItem('makis-user');
    if (!user) throw redirect({ to: '/auth' });
    const parsed = JSON.parse(user);
    if (parsed.role !== 'admin') throw redirect({ to: '/' });
  },
});

const routeTree = rootRoute.addChildren([indexRoute, authRoute, carritoRoute, productoRoute, adminRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
