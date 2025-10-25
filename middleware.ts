// middleware.ts (root level)
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Add auth middleware for protected routes
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = { matcher: ['/dashboard'] };