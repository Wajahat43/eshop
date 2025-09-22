type RedirectHandler = (redirectPath?: string) => void;

const sanitizeRedirect = (raw?: string) => {
  if (!raw) {
    return undefined;
  }

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch (error) {
    // noop - fall back to raw value if decoding fails
  }

  const trimmed = decoded.trim();
  if (!trimmed) {
    return undefined;
  }

  // Prevent protocol-relative or absolute external URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//')) {
    try {
      const url = new URL(trimmed, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      if (typeof window !== 'undefined' && url.origin === window.location.origin) {
        return `${url.pathname}${url.search}`;
      }
    } catch (error) {
      return undefined;
    }
    return undefined;
  }

  // Ensure path always starts with a single leading slash
  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed.replace(/^\/+/, '')}`;
  return normalized === '/login' ? undefined : normalized;
};

const buildLoginUrl = (redirectPath?: string) => {
  if (!redirectPath) {
    return '/login';
  }

  const params = new URLSearchParams();
  params.set('redirect', redirectPath);
  return `/login?${params.toString()}`;
};

let redirectToLogin: RedirectHandler = (redirectPath) => {
  const fallbackPath =
    typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : undefined;
  const safeRedirect = sanitizeRedirect(redirectPath ?? fallbackPath);
  const loginUrl = buildLoginUrl(safeRedirect);

  if (typeof window !== 'undefined') {
    window.location.href = loginUrl;
  }
};

export const setRedirectHandler = (handler: RedirectHandler) => {
  redirectToLogin = handler;
};

export const runRedirectToLogin = (redirectPath?: string) => {
  const safeRedirect = sanitizeRedirect(redirectPath);
  redirectToLogin(safeRedirect);
};

export { sanitizeRedirect };
