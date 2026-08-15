import type { AuthenticatedUser } from './types';

declare module 'express-session' {
  interface SessionData {
    oauthReturnTo?: string;
  }
}

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
  }
}

export {};
