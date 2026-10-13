const isDevelopment = process.env.NODE_ENV === "development";

function demoCatalog(params = {}) {
  // Demo catalog is a presentation fallback only; writes still require Mongo-backed products.
  return import("@/lib/demoProducts").then(({ demoProducts }) => {
    const keyword = String(params.keyword || "").toLowerCase();
    const category = String(params.category || "").toLowerCase();
    const filtered = demoProducts.filter((product) =>
      (!keyword || `${product.title} ${product.category} ${product.description}`.toLowerCase().includes(keyword)) &&
      (!category || product.category.toLowerCase() === category)
    );
    const pageSize = 6;
    const page = Math.max(1, Number(params.page) || 1);
    return { products: filtered.slice((page - 1) * pageSize, page * pageSize), page, pages: Math.ceil(filtered.length / pageSize), totalProducts: filtered.length, demo: true };
  });
}

export const API_URL = "/api";
const REQUEST_TIMEOUT_MS = 20000;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function api(path, options = {}) {
  // API and storefront share one Vercel origin.
  const pathValue = String(path);
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(pathValue)) throw new ApiError("Pass an API endpoint path, not a full URL.", 0);
  const endpoint = `${API_URL}/${pathValue.replace(/^\/+/, "").replace(/^(?:api\/)+/i, "")}`;
  let token = null;
  try { token = typeof window !== "undefined" ? localStorage.getItem("asim-token") : null; } catch { /* Storage may be disabled by browser policy. */ }
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(endpoint, { ...options, headers, signal: options.signal || controller.signal, cache: "no-store" });
  } catch (error) {
    if (error?.name === "AbortError") throw new ApiError(`The ASIAN STORE API did not respond within ${REQUEST_TIMEOUT_MS / 1000} seconds. Please try again.`, 0);
    throw new ApiError("Can't connect to the ASIAN STORE API. Check your connection and try again.", 0);
  } finally {
    clearTimeout(timeout);
  }
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json().catch(() => ({})) : { message: await response.text().catch(() => "") };
  if (!response.ok) throw new ApiError(data.message || data.error || "Something went wrong.", response.status);
  return data;
}

export const authApi = {
  signup: (body) => api("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => api("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  profile: () => api("/auth/profile"),
  adminDashboard: () => api("/auth/admin-dashboard"),
  forgotPassword: (body) => api("/auth/forgot-password", { method: "POST", body: JSON.stringify(body) }),
  resetPassword: (body) => api("/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),
};

export const userApi = {
  updateProfile: (body) => api("/users/profile", { method: "PUT", body: JSON.stringify(body) }),
};

export const productApi = {
  async list(params = {}) {
    const { demo = true, ...query } = params;
    try {
      const result = await api(`/products?${new URLSearchParams(Object.entries(query).filter(([, value]) => value))}`);
      if (isDevelopment && demo && !(result.products || []).length) return demoCatalog(query);
      return result;
    } catch (error) {
      if (!isDevelopment || !demo) throw error;
      return demoCatalog(query);
    }
  },
  async listAll(params = {}) {
    const first = await productApi.list({ ...params, page: 1 });
    if (!first.pages || first.pages <= 1) return first.products || [];
    const remaining = await Promise.all(Array.from({ length: first.pages - 1 }, (_, index) => productApi.list({ ...params, page: index + 2 })));
    return [...(first.products || []), ...remaining.flatMap((result) => result.products || [])];
  },
  get: async (id) => {
    if (isDevelopment && String(id).startsWith("demo-")) {
      const { demoProducts } = await import("@/lib/demoProducts");
      const product = demoProducts.find((item) => item._id === id);
      if (product) return product;
    }
    return api(`/products/${id}`);
  },
  review: (id, body) => api(`/products/${id}/reviews`, { method: "POST", body: JSON.stringify(body) }),
  create: (body) => api("/products", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => api(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id) => api(`/products/${id}`, { method: "DELETE" }),
};

export const cartApi = {
  get: () => api("/cart"),
  add: (productId, quantity = 1, variant = {}) => api("/cart", { method: "POST", body: JSON.stringify({ productId, quantity, variant }) }),
  remove: (id, itemId) => api(`/cart/${id}${itemId ? `?itemId=${encodeURIComponent(itemId)}` : ""}`, { method: "DELETE" }),
};

export const orderApi = {
  create: (shippingAddress, giftOptions = {}, payment = {}) => api("/orders", { method: "POST", body: JSON.stringify({ shippingAddress, giftOptions, ...payment }) }),
  mine: () => api("/orders/myorders"),
  track: (query) => api(`/orders/track?query=${encodeURIComponent(query)}`),
  updateStatus: (id, status) => api(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  paymentIntent: (orderId) => api("/orders/create-payment-intent", { method: "POST", body: JSON.stringify({ orderId }) }),
  markPaid: (id, result) => api(`/orders/${id}/pay`, { method: "PUT", body: JSON.stringify(result) }),
  verifyWalletPayment: (id, paymentStatus, paymentReference) => api(`/orders/${id}/payment-status`, { method: "PUT", body: JSON.stringify({ paymentStatus, paymentReference }) }),
};
