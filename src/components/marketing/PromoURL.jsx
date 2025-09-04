
export const PromoURL = (() => {
  const UTM_KEYS = new Set([
    "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"
  ]);

  const cleanCode = (code) =>
    (code || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");

  const toURL = (pathOrUrl) => {
    try {
      return new URL(pathOrUrl, window.location.origin);
    } catch {
      return new URL(String(pathOrUrl || "/"), window.location.origin);
    }
  };

  const get = () => {
    const url = new URL(window.location.href);
    const val = url.searchParams.get("promo");
    return val ? cleanCode(val) : null;
  };

  const has = () => !!get();

  const _emit = (name, props = {}) => {
    try { window.dispatchEvent(new CustomEvent(`promo:${name}`, { detail: props })); } catch {}
    // In a real app, you'd wire this to your analytics service
    // e.g., analytics?.track?.(name, props);
    console.log(`[Promo Event] ${name}:`, props);
  };

  const set = (code, opts = {}) => {
    const c = cleanCode(code);
    if (!c) return;
    const url = new URL(window.location.href);
    url.searchParams.set("promo", c);
    // Keep UTM; nothing else is removed
    if (opts.replaceHistory !== false) {
      window.history.replaceState({}, "", url.toString());
    } else {
      window.history.pushState({}, "", url.toString());
    }
    _emit("promo_param_set", { code: c, source: "manual_set" });
  };

  const remove = (opts = {}) => {
    const url = new URL(window.location.href);
    url.searchParams.delete("promo");
    if (opts.replaceHistory !== false) {
      window.history.replaceState({}, "", url.toString());
    } else {
      window.history.pushState({}, "", url.toString());
    }
    _emit("promo_param_removed", {});
  };

  const _mergeParams = (src, dst, preserveUtm = true) => {
    // Copy UTM if not present on dst yet
    if (preserveUtm) {
      src.searchParams.forEach((v, k) => {
        if (UTM_KEYS.has(k) && !dst.searchParams.has(k)) {
          dst.searchParams.set(k, v);
        }
      });
    }
  };

  const applyToUrl = (pathOrUrl, opts = {}) => {
    const { force = false, preserveUtm = true } = opts;
    const dest = toURL(pathOrUrl);
    const current = new URL(window.location.href);
    const currentPromo = get();
    const destPromo = dest.searchParams.get("promo");

    // Preserve UTM params from current URL
    _mergeParams(current, dest, preserveUtm);

    if (destPromo) {
      // Respect existing promo unless force=true
      if (force && currentPromo) dest.searchParams.set("promo", cleanCode(currentPromo));
      else dest.searchParams.set("promo", cleanCode(destPromo));
      return dest.pathname + dest.search + dest.hash;
    }
    if (currentPromo) {
      dest.searchParams.set("promo", currentPromo);
    }
    return dest.pathname + dest.search + dest.hash;
  };

  const inheritFromCurrent = (pathOrUrl, opts = {}) => applyToUrl(pathOrUrl, opts);

  const syncFromCurrentUrl = () => {
    const code = get();
    if (code) {
      _emit("promo_param_detected", { code });
      // Optional: validate asynchronously; don't block UI
      try {
        // This assumes PromoStore is available on the window or can be imported.
        // A more robust solution might use a pub/sub system.
        const { promoStore } = import('./PromoStore');
        promoStore?.apply?.(code, "pro", "annual");
      } catch {}
    }
  };

  // Note: This needs to be integrated with your app's router
  const navigateWithPromo = (navigate, to, { force = false } = {}) => {
    const href = inheritFromCurrent(to, { preserveUtm: true, force });
    navigate(href);
  };

  return {
    get, has, set, remove,
    applyToUrl, inheritFromCurrent,
    syncFromCurrentUrl, navigateWithPromo
  };
})();
