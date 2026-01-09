export const BillingURL = (() => {
  const KEY = "rezemai_billing_pref";            // localStorage
  const PARAM = "billing";
  const DEFAULT = "annual";
  const VALID = new Set(["monthly", "annual"]);
  const DO_NOT_INJECT = [/^\/admin\//, /^\/auth\//, /^\/api\//, /^\/legalprivacy/, /^\/legalterms/]; // don't auto-write billing here

  const clean = (v) => (VALID.has(String(v).toLowerCase()) ? String(v).toLowerCase() : null);

  const currentUrl = () => new URL(window.location.href);

  const get = () => {
    const url = currentUrl();
    const fromUrl = clean(url.searchParams.get(PARAM));
    if (fromUrl) return fromUrl;
    const fromLS = clean(localStorage.getItem(KEY));
    return fromLS || null;
  };

  const has = () => !!clean(currentUrl().searchParams.get(PARAM));

  const _emit = (name, detail = {}) => {
    try { window.dispatchEvent(new CustomEvent(`billing:${name}`, { detail })); } catch {}
    // analytics?.track?.(name, detail); // wire if desired
  };

  const set = (value, opts = {}) => {
    const v = clean(value) || DEFAULT;
    const url = currentUrl();
    url.searchParams.set(PARAM, v);
    // keep all other params (promo, UTM, etc.)
    if (opts.replaceHistory !== false) {
      window.history.replaceState({}, "", url.toString());
    } else {
      window.history.pushState({}, "", url.toString());
    }
    localStorage.setItem(KEY, v);
    window.currentBillingToggle = v; // convenient global for existing code
    _emit("changed", { billing: v });
  };

  const toggle = () => set(get() === "annual" ? "monthly" : "annual");

  const remove = (opts = {}) => {
    const url = currentUrl();
    url.searchParams.delete(PARAM);
    if (opts.replaceHistory !== false) {
      window.history.replaceState({}, "", url.toString());
    } else {
      window.history.pushState({}, "", url.toString());
    }
    _emit("removed", {});
  };

  const toURL = (pathOrUrl) => {
    try { return new URL(pathOrUrl, window.location.origin); }
    catch { return new URL(String(pathOrUrl || "/"), window.location.origin); }
  };

  // Ensure the destination URL carries a valid billing value (if missing)
  const applyToUrl = (pathOrUrl, { force = false, value = null } = {}) => {
    const dest = toURL(pathOrUrl);
    const destVal = clean(dest.searchParams.get(PARAM));
    const curr = get() || DEFAULT;
    const finalVal = clean(value) || curr;

    if (destVal && !force) return dest.toString();
    dest.searchParams.set(PARAM, destVal || finalVal);
    return dest.toString();
  };

  const inheritFromCurrent = (pathOrUrl) => applyToUrl(pathOrUrl);

  // Run once on app mount
  const syncFromCurrentUrl = () => {
    const path = window.location.pathname;
    if (DO_NOT_INJECT.some((re) => re.test(path))) {
      // Still set a memory default
      const mem = get() || DEFAULT;
      window.currentBillingToggle = mem;
      _emit("detected", { billing: mem, injected: false });
      return;
    }

    const url = currentUrl();
    const detected = clean(url.searchParams.get(PARAM));
    if (detected) {
      // Persist and announce
      localStorage.setItem(KEY, detected);
      window.currentBillingToggle = detected;
      _emit("detected", { billing: detected, injected: false });
      return;
    }

    // No param → inject preferred or default (replaceState to avoid history spam)
    const pref = clean(localStorage.getItem(KEY)) || DEFAULT;
    url.searchParams.set(PARAM, pref);
    window.history.replaceState({}, "", url.toString());
    window.currentBillingToggle = pref;
    _emit("detected", { billing: pref, injected: true });
  };

  const subscribe = (fn) => {
    const handler = (e) => fn(e.detail?.billing || get() || DEFAULT);
    window.addEventListener("billing:changed", handler);
    return () => window.removeEventListener("billing:changed", handler);
  };

  // UI helper for your pricing toggle
  // Expecting a button or switch; calls set("monthly"/"annual") based on state
  const bindToggle = (el, { getValue }) => {
    if (!el || typeof getValue !== "function") return;
    el.addEventListener("click", () => set(getValue()));
  };

  return {
    get, has, set, toggle, remove,
    applyToUrl, inheritFromCurrent,
    syncFromCurrentUrl, subscribe, bindToggle
  };
})();