"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toastLibrary, { Toaster } from "react-hot-toast";
import { authApi, cartApi, userApi } from "@/lib/api";
import { shippingCountries } from "@/lib/regions";
import { supportedLanguages, translations } from "@/lib/localization";
import { loadCurrencyRate, supportedCurrencies } from "@/lib/currency";

const StoreContext = createContext(null);
const LOCAL_CART_KEY = "asian-store-local-cart";
const isDevelopment = process.env.NODE_ENV !== "production";
const isMockToken = (token) => typeof token === "string" && token.startsWith("mock-session:");

function getLocalCart() {
  try {
    const value = JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

function saveLocalCart(items) {
  try { localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items)); } catch { /* Keep the cart in memory for this session. */ }
}

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [ready, setReady] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [theme, setThemeState] = useState("light");
  const [selectedCountry, setSelectedCountry] = useState("Pakistan");
  const [language, setLanguageState] = useState("en");
  const [currency, setCurrencyState] = useState("USD");
  const [currencyRate, setCurrencyRate] = useState(1);
  const [currencyDate, setCurrencyDate] = useState(null);
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const toast = useCallback((message, type = "success") => {
    if (type === "error") toastLibrary.error(message);
    else if (type === "info") toastLibrary(message, { icon: "✦" });
    else toastLibrary.success(message);
  }, []);

  const setTheme = useCallback((nextTheme) => {
    if (nextTheme !== "light" && nextTheme !== "dark") return;
    setThemeState(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    try { localStorage.setItem("asim-theme", nextTheme); } catch { /* Keep the current session theme when storage is unavailable. */ }
  }, []);

  const setLanguage = useCallback((code) => {
    const selected = supportedLanguages.find(({ code: languageCode }) => languageCode === code);
    if (!selected) return;
    setLanguageState(selected.code);
    document.documentElement.lang = selected.code;
    document.documentElement.dir = selected.direction;
    try { localStorage.setItem("asian-store-language", selected.code); } catch { /* Keep the language for this session. */ }
  }, []);

  const setCurrency = useCallback(async (code) => {
    if (!supportedCurrencies.some(({ code: currencyCode }) => currencyCode === code)) return;
    setCurrencyLoading(true);
    try {
      const { rate, date } = await loadCurrencyRate(code);
      setCurrencyState(code);
      setCurrencyRate(rate);
      setCurrencyDate(date);
      try { localStorage.setItem("asian-store-currency", code); } catch { /* Keep the currency for this session. */ }
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setCurrencyLoading(false);
    }
  }, [toast]);

  const formatPrice = useCallback((amount) => {
    const locale = supportedLanguages.find(({ code }) => code === language)?.locale || "en-US";
    return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format((Number(amount) || 0) * currencyRate);
  }, [currency, currencyRate, language]);

  const t = useCallback((key) => translations[language]?.[key] || translations.en[key] || key, [language]);

  const setShippingCountry = useCallback((country) => {
    if (!shippingCountries.includes(country)) return;
    setSelectedCountry(country);
    try { localStorage.setItem("asian-store-country", country); } catch { /* Keep the selected country for this session. */ }
  }, []);

  const toggleFavorite = useCallback((product) => {
    const id = product._id || product.id;
    const exists = favorites.some((item) => (item._id || item.id) === id);
    const next = exists ? favorites.filter((item) => (item._id || item.id) !== id) : [...favorites, product];
    setFavorites(next);
    try {
      localStorage.setItem("asim-favorites", JSON.stringify(next));
      toast(exists ? "Removed from your wishlist" : "Saved to your wishlist", exists ? "info" : "success");
    } catch {
      toast("Your wishlist changed, but this browser could not save it.", "error");
    }
  }, [favorites, toast]);

  const isFavorite = useCallback((id) => favorites.some((item) => (item._id || item.id) === id), [favorites]);

  const refreshCart = useCallback(async () => {
    const token = localStorage.getItem("asim-token");
    if (!token || isMockToken(token)) { setCart(getLocalCart()); return; }
    setCartLoading(true);
    try { const remoteCart = await cartApi.get(); setCart([...(remoteCart.items || []), ...getLocalCart()]); }
    catch (error) {
      if (error.status === 401) { localStorage.removeItem("asim-token"); localStorage.removeItem("asim-user"); setUser(null); }
      else toast(error.message, "error");
    }
    finally { setCartLoading(false); }
  }, [toast]);

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const storedTheme = localStorage.getItem("asim-theme") === "dark" ? "dark" : "light";
        const storedCountry = localStorage.getItem("asian-store-country");
        const storedLanguage = localStorage.getItem("asian-store-language");
        const storedCurrency = localStorage.getItem("asian-store-currency");
        if (shippingCountries.includes(storedCountry)) setSelectedCountry(storedCountry);
        const selectedLanguage = supportedLanguages.find(({ code }) => code === storedLanguage) || supportedLanguages[0];
        setLanguageState(selectedLanguage.code);
        document.documentElement.lang = selectedLanguage.code;
        document.documentElement.dir = selectedLanguage.direction;
        if (supportedCurrencies.some(({ code }) => code === storedCurrency)) setCurrency(storedCurrency);
        setThemeState(storedTheme);
        document.documentElement.classList.toggle("dark", storedTheme === "dark");
        setFavorites(JSON.parse(localStorage.getItem("asim-favorites") || "[]"));
      } catch { setFavorites([]); }
    });
    let token = null;
    try { token = localStorage.getItem("asim-token"); } catch { /* Continue as a signed-out visitor. */ }
    if (!token || isMockToken(token)) {
      Promise.resolve().then(() => {
        if (isMockToken(token)) {
          try { setUser(JSON.parse(localStorage.getItem("asim-user") || "null")); } catch { setUser(null); }
        }
        setCart(getLocalCart());
        setReady(true);
      });
      return;
    }
    Promise.resolve().then(() => {
      try { setUser(JSON.parse(localStorage.getItem("asim-user") || "null")); } catch { setUser(null); }
    });
    Promise.resolve().then(() => authApi.profile()).then((profile) => { setUser(profile); localStorage.setItem("asim-user", JSON.stringify(profile)); return refreshCart(); })
      .catch((error) => {
        if (error.status === 401 || error.status === 403) { localStorage.removeItem("asim-token"); localStorage.removeItem("asim-user"); setUser(null); }
        else toast(error.message, "error");
      })
      .finally(() => setReady(true));
  }, [refreshCart, setCurrency, toast]);

  const signIn = useCallback(async (credentials) => {
    try {
      const result = await authApi.login(credentials);
      localStorage.setItem("asim-token", result.token);
      localStorage.setItem("asim-user", JSON.stringify(result.user));
      setUser(result.user);
      await refreshCart();
      return result.user;
    } catch (error) {
      if (!isDevelopment || error.status !== 0) throw error;
      const mockUser = { id: `demo-${credentials.email.toLowerCase()}`, name: credentials.name || credentials.email.split("@")[0], email: credentials.email, role: "customer", mockSession: true };
      localStorage.setItem("asim-token", `mock-session:${mockUser.id}`);
      localStorage.setItem("asim-user", JSON.stringify(mockUser));
      setUser(mockUser);
      setCart(getLocalCart());
      toast("Demo session started. Your cart is saved in this browser.", "info");
      return mockUser;
    }
  }, [refreshCart, toast]);
  const signOut = useCallback(() => { localStorage.removeItem("asim-token"); localStorage.removeItem("asim-user"); setUser(null); setCart(getLocalCart()); toast("You have signed out.", "info"); }, [toast]);
  const updateProfile = useCallback(async (profile) => {
    const updated = await userApi.updateProfile(profile);
    setUser((current) => ({ ...current, ...updated }));
    localStorage.setItem("asim-user", JSON.stringify({ ...user, ...updated }));
    return updated;
  }, [user]);
  const addToCart = useCallback(async (id, quantity = 1, variant = {}, product = null) => {
    const token = localStorage.getItem("asim-token");
    const useLocalCart = !token || isMockToken(token) || String(id).startsWith("demo-");
    if (useLocalCart) {
      if (!product) throw new Error("This item cannot be added to a local demo cart.");
      const current = getLocalCart();
      const selected = { size: variant.size || "", color: variant.color || "" };
      const index = current.findIndex((item) => String(item.product?._id || item.product?.id) === String(id) && (item.variant?.size || "") === selected.size && (item.variant?.color || "") === selected.color);
      const next = [...current];
      if (index >= 0) {
        const nextQuantity = next[index].quantity + Number(quantity);
        if (nextQuantity <= 0) next.splice(index, 1);
        else next[index] = { ...next[index], quantity: nextQuantity };
      } else if (Number(quantity) > 0) next.push({ _id: `local-${id}-${Date.now()}`, product, quantity: Number(quantity), variant: selected });
      saveLocalCart(next);
      const serverItems = token && !isMockToken(token) ? cart.filter((item) => !String(item._id || "").startsWith("local-")) : [];
      setCart([...serverItems, ...next]);
      return next;
    }
    const next = await cartApi.add(id, quantity, variant);
    setCart(next.items || []);
    return next.items || [];
  }, [cart]);
  const removeFromCart = useCallback(async (id, itemId) => {
    const token = localStorage.getItem("asim-token");
    if (!token || isMockToken(token) || String(itemId || "").startsWith("local-")) {
      const next = getLocalCart().filter((item) => itemId ? item._id !== itemId : String(item.product?._id || item.product?.id) !== String(id));
      saveLocalCart(next);
      const serverItems = token && !isMockToken(token) ? cart.filter((item) => !String(item._id || "").startsWith("local-")) : [];
      setCart([...serverItems, ...next]);
      return next;
    }
    const next = await cartApi.remove(id, itemId);
    setCart(next.items || []);
    return next.items || [];
  }, [cart]);
  const clearCart = useCallback(async ({ remote = false } = {}) => {
    const token = localStorage.getItem("asim-token");
    if (remote && token && !isMockToken(token)) {
      await Promise.all(cart.map((item) => cartApi.remove(item.product?._id, item._id)));
    }
    saveLocalCart([]);
    setCart([]);
  }, [cart]);

  const value = useMemo(() => ({ user, cart, ready, cartLoading, signIn, signOut, updateProfile, addToCart, removeFromCart, clearCart, refreshCart, favorites, toggleFavorite, isFavorite, theme, setTheme, selectedCountry, setShippingCountry, language, setLanguage, t, currency, setCurrency, currencyRate, currencyDate, currencyLoading, formatPrice, toast }), [user, cart, ready, cartLoading, signIn, signOut, updateProfile, addToCart, removeFromCart, clearCart, refreshCart, favorites, toggleFavorite, isFavorite, theme, setTheme, selectedCountry, setShippingCountry, language, setLanguage, t, currency, setCurrency, currencyRate, currencyDate, currencyLoading, formatPrice, toast]);
  return <StoreContext.Provider value={value}>{children}<Toaster position="bottom-right" toastOptions={{ duration: 3200, className: "asim-toast", style: { borderRadius: "14px", background: "#000000", color: "#fff", fontSize: "13px", boxShadow: "0 16px 40px rgba(45, 16, 84, .2)" } }} /></StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside StoreProvider");
  return value;
}
