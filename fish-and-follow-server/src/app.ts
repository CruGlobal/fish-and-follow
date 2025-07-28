import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import session from 'express-session';
import passport from 'passport';
import bodyParser from "body-parser";
import { Strategy } from 'passport-openidconnect';
import { requireAuth } from './middleware/auth';
import { CipherKey } from 'crypto';

import { qrRouter } from './routes/qrCodeRouter';
import { contactsRouter } from './routes/contacts.router';
import { followUpStatusRouter } from './routes/followUpStatus.router';
import { rolesRouter } from './routes/roles.router';
import { usersRouter } from './routes/users.router';
import { whatsappRouter } from './whatsapp-api/whatsapp.router';
import { sendSMS } from "./middleware/sendSMS";

dotenv.config();
import fs from 'fs';
import cors from 'cors';



const DATA_FILE = './resources.json';
const app = express();
const protectedRouter = express.Router();

const oktaClientID = process.env.OKTA_CLIENT_ID;
const oktaClientSecret = process.env.OKTA_CLIENT_SECRET;
const oktaDomain = process.env.OKTA_DOMAIN_URL;

const sessionSecret = process.env.SESSION_SECRET as CipherKey;

const port = process.env.PORT || 3000;


type Resource = {
  id: number;
  title: string;
  url: string;
  description: string;
}

app.use(cors());
app.use(express.json());

function loadResources(): Resource[] {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  }
  return [];
}

function saveResources(resources: Resource[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(resources, null, 2));
}



/**
 * This is a healthcheck for container monitoring (datadog).
 * Just needs to respond with 200. Does not require auth.
 */
app.get('/healthcheck', (_req, res: Response) => {
  res.status(200).send("Ok");
});

// Proper CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
  issuer: `https://${oktaDomain}`,
  authorizationURL: `https://${oktaDomain}/oauth2/v1/authorize`,
  tokenURL: `https://${oktaDomain}/oauth2/v1/token`,
  userInfoURL: `https://${oktaDomain}/oauth2/v1/userinfo`,
  clientID: oktaClientID || '',
  clientSecret: oktaClientSecret || '',
  callbackURL: 'http://localhost:3000/authorization-code/callback',
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
    res.redirect('http://localhost:5173/contacts');
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
        redirectUrl: 'http://localhost:5173/'
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
      res.redirect('http://localhost:5173/');
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
protectedRouter.use('/whatsapp', whatsappRouter);

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

app.get('/api/resources', (_req, res) => {
  const resources = loadResources();
  res.json(resources);
});

app.post('/api/resources', (req, res) => {
  const { title, url, description } = req.body;
  const resources = loadResources();
  const newResource = {
    id: resources.length + 1,
    title,
    url,
    description
  };
  resources.push(newResource);
  saveResources(resources);
  res.status(201).json(newResource);
});

app.post("/api/send-sms", async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: "Missing 'to' or 'message' in request body" });
  }

  try {
  await sendSMS(to, message);
  res.status(200).json({ success: true, message: "SMS sent!" });
} catch (error: any) {
  console.error("SMS sending failed:", error);
  res.status(500).json({ error: "Failed to send SMS", details: error.message });
}
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
