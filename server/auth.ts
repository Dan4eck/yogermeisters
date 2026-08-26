import { Router, type RequestHandler } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Passport } from 'passport';
import { Strategy as GoogleStrategy, type Profile } from 'passport-google-oauth20';
import type { Pool } from 'pg';

import type { RuntimeConfig } from './config';
import type { CourseRepository } from './course-repository';
import type { AuthenticatedUser } from './types';

export interface Authentication {
  readonly middleware: readonly RequestHandler[];
  readonly router: Router;
}

export function createUnavailableAuthentication(): Authentication {
  const router = Router();
  const unavailable: RequestHandler = (_req, res) => {
    res.status(503).json({ code: 'auth_not_configured', message: 'Authentication is not configured' });
  };

  router.get('/google', unavailable);
  router.get('/google/callback', unavailable);
  router.post('/logout', (_req, res) => res.status(204).end());

  return { middleware: [], router };
}

export function createDevelopmentAuthentication(repository: CourseRepository, email: string): Authentication {
  const router = Router();
  router.get('/google', (req, res) => res.redirect(readSafeReturnTo(req.query.next)));
  router.get('/google/callback', (_req, res) => res.redirect('/cabinet'));
  router.post('/logout', (_req, res) => res.status(204).end());

  let userPromise: Promise<AuthenticatedUser | null> | undefined;
  const middleware: RequestHandler = (req, _res, next) => {
    userPromise ??= repository.findUserByEmail(email);
    void userPromise
      .then((user) => {
        if (user) {
          req.user = user;
          req.isAuthenticated = (() => true) as typeof req.isAuthenticated;
        }
        next();
      })
      .catch(next);
  };

  return { middleware: [middleware], router };
}

export function createAuthentication(
  config: RuntimeConfig,
  pool: Pool,
  repository: CourseRepository,
): Authentication {
  if (
    !config.sessionSecret
    || config.sessionSecret.length < 32
    || !config.googleClientId
    || !config.googleClientSecret
  ) {
    return createUnavailableAuthentication();
  }

  const PgSession = connectPgSimple(session);
  const sessionMiddleware = session({
    name: 'yogermeisters.sid',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new PgSession({ pool, tableName: 'user_sessions', createTableIfMissing: false }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    },
  });

  const passport = new Passport();
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      done(null, (await repository.findUserById(id)) ?? false);
    } catch (error) {
      done(error);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: config.googleCallbackUrl,
        state: true,
      },
      async (_accessToken: string, _refreshToken: string, profile: Profile, done) => {
        try {
          const email = profile.emails?.find((entry) => entry.verified !== false)?.value;
          if (!email) {
            done(new Error('Google account did not provide a verified email'));
            return;
          }

          const user = await repository.upsertGoogleUser({
            googleSubject: profile.id,
            email: email.toLowerCase(),
            name: profile.displayName || email,
            avatarUrl: profile.photos?.[0]?.value ?? null,
          });
          done(null, user);
        } catch (error) {
          done(error);
        }
      },
    ),
  );

  const router = Router();
  router.get(
    '/google',
    (req, _res, next) => {
      req.session.oauthReturnTo = readSafeReturnTo(req.query.next);
      next();
    },
    passport.authenticate('google', { scope: ['openid', 'profile', 'email'] }),
  );
  router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=oauth', keepSessionInfo: true }),
    (req, res) => {
      const returnTo = readSafeReturnTo(req.session.oauthReturnTo);
      delete req.session.oauthReturnTo;
      res.redirect(returnTo);
    },
  );
  router.post('/logout', createLogoutHandler());

  return {
    middleware: [sessionMiddleware, passport.initialize(), passport.session()],
    router,
  };
}

function readSafeReturnTo(value: unknown): string {
  return typeof value === 'string' && /^\/cabinet(?:\/|$)/.test(value) ? value : '/cabinet';
}

export function createLogoutHandler(cookieName = 'yogermeisters.sid'): RequestHandler {
  return (req, res, next) => {
    req.logout((logoutError) => {
      if (logoutError) {
        next(logoutError);
        return;
      }

      req.session.destroy((sessionError) => {
        if (sessionError) {
          next(sessionError);
          return;
        }
        res.clearCookie(cookieName);
        res.status(204).end();
      });
    });
  };
}
