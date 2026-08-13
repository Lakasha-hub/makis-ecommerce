const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getToken(): string | null {
  return localStorage.getItem('makis-token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error desconocido');
  return json;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// Products
export async function listProducts(): Promise<import('./catalog').Product[]> {
  const res = await api.get<{ data: import('./catalog').Product[] }>('/api/products');
  return res.data;
}
export async function getProduct(id: string): Promise<import('./catalog').Product> {
  const res = await api.get<{ data: import('./catalog').Product }>(`/api/products/${id}`);
  return res.data;
}

// Auth
export async function loginApi(email: string, password: string) {
  const res = await api.post<{ data: { user: unknown; token: string } }>('/api/auth/login', { email, password });
  return res.data;
}
export async function registerApi(name: string, email: string, password: string) {
  const res = await api.post<{ data: { user: unknown; token: string } }>('/api/auth/register', { name, email, password });
  return res.data;
}
