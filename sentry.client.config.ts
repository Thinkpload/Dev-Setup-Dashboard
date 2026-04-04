import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  // Only enable Sentry when DSN is configured — no-op in local dev without DSN
  enabled: !!(process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN),
  // Suppress console noise in test environments
  debug: false,
});
