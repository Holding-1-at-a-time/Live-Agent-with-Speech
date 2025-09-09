// Fix: Module '"@clerk/nextjs"' has no exported member 'authMiddleware'. It has been replaced by `clerkMiddleware` from `@clerk/nextjs/server`.
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// All routes are protected by default.
// Public routes, like the root page, are exempt from authentication.
const isPublicRoute = createRouteMatcher(['/']);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
