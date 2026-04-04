// Clerk auth — server-side utilities
// Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in .env
//
// For client-side hooks (useAuth, useUser, useSession),
// import directly from '@clerk/nextjs' in your client components.

export { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
