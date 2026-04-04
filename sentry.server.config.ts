import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  // Only enable Sentry when DSN is configured — no-op when SENTRY_DSN is unset
  enabled: !!process.env.SENTRY_DSN,
  debug: false,
});
