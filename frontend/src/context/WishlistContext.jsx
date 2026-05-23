import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  fetchWishlistIds,
  fetchWishlist,
  addToWishlistApi,
  removeFromWishlistApi,
} from "../api";

const WishlistContext = createContext(null);
const LOCAL_KEY = "moda-wishlist-local";

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [ids, setIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const refresh = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const serverIds = await fetchWishlistIds();
        setIds(serverIds);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(serverIds));
      } catch {
        /* keep local */
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
  }, [ids]);

  const isWishlisted = (productId) => ids.includes(productId);

  const toggleWishlist = async (productId) => {
    const has = ids.includes(productId);
    if (isAuthenticated) {
      if (has) await removeFromWishlistApi(productId);
      else await addToWishlistApi(productId);
    }
    setIds((prev) =>
      has ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
    return !has;
  };

  return (
    <WishlistContext.Provider
      value={{ ids, isWishlisted, toggleWishlist, refresh, count: ids.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
