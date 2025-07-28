import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy } from 'passport-openidconnect';
import { requireAuth } from './middleware/auth';
import { CipherKey } from 'crypto';

import { qrRouter } from './routes/qrCodeRouter';
import { contactsRouter } from './routes/contacts.router';
import { followUpStatusRouter } from './routes/followUpStatus.router';
import { rolesRouter } from './routes/roles.router';
import { usersRouter } from './routes/users.router';

dotenv.config();

const app = express();
const protectedRouter = express.Router();

const isProduction = process.env.NODE_ENV === 'production';
const devFrontend = 'http://localhost:5173';
const devBackend = 'http://localhost:3000'

const oktaClientID = process.env.OKTA_CLIENT_ID;
const oktaClientSecret = process.env.OKTA_CLIENT_SECRET;

if (!process.env.OKTA_DOMAIN_URL) {
  throw new Error("Missing Okta Domain URL");
}

const oktaDomain = isProduction ? process.env.OKTA_DOMAIN_URL : `https://${process.env.OKTA_DOMAIN_URL}`;
const sessionSecret = process.env.SESSION_SECRET as CipherKey;
const siteUrl = process.env.BASE_URL ?? devFrontend;
const callbackURL = process.env.OKTA_REDIRECT_URI ?? `${devBackend}/authorization-code/callback`;

const port = process.env.PORT || 3000;

/**
 * This is a helathcheck for container monitoring (datadog).
 * Just needs to respond with 200. Does not require auth.
 */
app.get('/healthcheck', (_req, res: Response) => {
  res.status(200).send("Ok");
});

if (!isProduction) {
  // Proper CORS configuration
  app.use(cors({
    origin: [devFrontend, devBackend],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
}


// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use('oidc', new Strategy({
  issuer: oktaDomain,
  authorizationURL: `${oktaDomain}/oauth2/v1/authorize`,
  tokenURL: `${oktaDomain}/oauth2/v1/token`,
  userInfoURL: `${oktaDomain}/oauth2/v1/userinfo`,
  clientID: oktaClientID || '',
  clientSecret: oktaClientSecret || '',
  callbackURL,
  scope: 'openid profile'
}, (issuer: any, profile: any, done: any) => {
  return done(null, profile);
}));

passport.serializeUser((user: any, next: any) => {
  next(null, user);
});

passport.deserializeUser((obj: any, next: any) => {
  next(null, obj);
});

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Express with TypeScript!');
});

app.get('/auth/status', (req: Request, res: Response) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.user || null
  });
});

// Auth routes (public)
app.get('/signin', passport.authenticate('oidc'));

app.get('/authorization-code/callback',
  passport.authenticate('oidc', { failureMessage: true, failWithError: true }),
  (req: Request, res: Response) => {
    // Redirect to your frontend after successful auth
    res.redirect(`${siteUrl}/contacts`);
  }
);

app.post('/signout', (req: Request, res: Response, next: any) => {
  req.logout((err: any) => {
    if (err) { return next(err); }

    req.session.destroy((err: any) => {
      if (err) { return next(err); }

      // Send JSON response instead of redirect
      res.json({
        success: true,
        message: 'Logged out successfully',
        redirectUrl: siteUrl
      });
    });
  });
});

app.get('/signout', (req: Request, res: Response, next: any) => {
  req.logout((err: any) => {
    if (err) { return next(err); }

    req.session.destroy((err: any) => {
      if (err) { return next(err); }

      // Redirect for GET requests
      res.redirect(siteUrl);
    });
  });
});

// Apply auth middleware to all routes in the protected router
protectedRouter.use(requireAuth);

// Protected routes
protectedRouter.use('/contacts', contactsRouter);
protectedRouter.use('/users', usersRouter);
protectedRouter.use('/follow-up-status', followUpStatusRouter);
protectedRouter.use('/roles', rolesRouter);
protectedRouter.use('/qr', qrRouter);

// Mount the protected router
app.use('/api', protectedRouter);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
