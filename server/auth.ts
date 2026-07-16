import { Router, type RequestHandler } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Passport } from 'passport';
import { Strategy as GoogleStrategy, type Profile } from 'passport-google-oauth20';
import type { Pool } from 'pg';

import type { RuntimeConfig } from './config';
import type { CourseRepository } from './course-repository';

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
  router.get('/google', passport.authenticate('google', { scope: ['openid', 'profile', 'email'] }));
  router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=oauth' }),
    (_req, res) => res.redirect('/cabinet'),
  );
  router.post('/logout', createLogoutHandler());

  return {
    middleware: [sessionMiddleware, passport.initialize(), passport.session()],
    router,
  };
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
