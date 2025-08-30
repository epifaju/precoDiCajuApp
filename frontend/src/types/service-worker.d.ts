/// <reference lib="webworker" />

declare module 'workbox-precaching' {
  export function precacheAndRoute(entries: Array<string | { url: string; revision: string | null }>): void;
}

declare module 'workbox-routing' {
  export function registerRoute(
    capture: RegExp | string | ((options: { url: URL; request: Request; event: ExtendableEvent }) => boolean),
    handler: any,
    method?: string
  ): void;
}

declare module 'workbox-strategies' {
  export class StaleWhileRevalidate {
    constructor(options?: any);
  }
  
  export class CacheFirst {
    constructor(options?: any);
  }
}

declare module 'workbox-expiration' {
  export class ExpirationPlugin {
    constructor(options?: any);
  }
}

// Extend ServiceWorkerGlobalScope
interface ServiceWorkerGlobalScope {
  __WB_MANIFEST: Array<string | { url: string; revision: string | null }>;
}

// Extend Window interface
interface Window {
  isSecureContext: boolean;
}

