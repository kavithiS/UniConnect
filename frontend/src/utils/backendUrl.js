const LOCAL_BACKEND_CANDIDATES = Array.from({ length: 10 }, (_, index) =>
  `http://localhost:${5000 + index}`,
);

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const isLocalHost = () =>
  typeof window !== "undefined" &&
  /localhost|127\.0\.0\.1/.test(window.location.hostname);

export const getBackendBaseUrl = () => {
  const envUrl = import.meta?.env?.VITE_BACKEND_URL;
  if (envUrl) return trimTrailingSlash(envUrl);

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("backendBaseUrl");
    // Only return stored value if it's valid (not an old dead port)
    if (stored && !stored.includes("5001")) {
      return trimTrailingSlash(stored);
    }
    // Clear invalid stored values
    if (stored && stored.includes("5001")) {
      localStorage.removeItem("backendBaseUrl");
    }
  }

  return "http://localhost:5000";
};

export const getApiBaseUrl = () => `${getBackendBaseUrl()}/api`;

export const detectBackendBaseUrl = async () => {
  const envUrl = import.meta?.env?.VITE_BACKEND_URL;
  if (envUrl) {
    const normalized = trimTrailingSlash(envUrl);
    if (typeof window !== "undefined") localStorage.setItem("backendBaseUrl", normalized);
    return normalized;
  }

  if (!isLocalHost()) {
    return getBackendBaseUrl();
  }

  const stored =
    typeof window !== "undefined" ? localStorage.getItem("backendBaseUrl") : null;

  // Always try to re-detect on localhost to find the actual running backend
  // Start with stored or 5000, then try others
  const candidates = stored && !stored.includes("5001")
    ? [trimTrailingSlash(stored), ...LOCAL_BACKEND_CANDIDATES.filter((c) => c !== trimTrailingSlash(stored))]
    : LOCAL_BACKEND_CANDIDATES;

  for (const base of candidates) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);
      
      // Try both routes - be more forgiving with timeouts
      const projectsRes = await fetch(`${base}/api/projects`, {
        signal: controller.signal,
      }).catch(() => ({ ok: false, status: 0 }));
      
      clearTimeout(timeout);

      // Accept any successful response
      if (projectsRes.ok) {
        if (typeof window !== "undefined") {
          localStorage.setItem("backendBaseUrl", base);
        }
        console.log(`✅ Backend detected at: ${base}`);
        return base;
      }
    } catch {
      // Try next candidate
      continue;
    }
  }

  console.warn("⚠️ No backend detected, falling back to default");
  return getBackendBaseUrl();
};
