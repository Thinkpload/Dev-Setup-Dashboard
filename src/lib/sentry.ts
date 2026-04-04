import * as Sentry from '@sentry/nextjs';

// Sentry is initialized automatically via sentry.client.config.ts / sentry.server.config.ts
// This module re-exports Sentry for manual error capture (e.g. in error boundaries, Server Actions)
// When SENTRY_DSN is not set, the SDK is disabled (enabled: false) — no-op, no crashes

export { Sentry };
