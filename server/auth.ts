import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage.js";
import type { User as SelectUser } from "../shared/schema.js";
import { encryptData, safeDecrypt } from "./encryption.js";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Hash password with salt for secure storage
export async function hashPassword(password: string) {
  // Generate a random salt
  const salt = randomBytes(16).toString("hex");
  // Hash the password with the salt using scrypt (more secure than bcrypt)
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  // Return the hashed password with the salt appended
  return `${buf.toString("hex")}.${salt}`;
}

// Securely compare stored hashed password with supplied password
async function comparePasswords(supplied: string, stored: string) {
  // Split the stored value to extract hash and salt
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) return false;
  const hashedBuf = Buffer.from(hashed, "hex");
  // Hash the supplied password with the same salt
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  if (hashedBuf.length !== suppliedBuf.length) return false;
  // Use timingSafeEqual to prevent timing attacks
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Look up a user by username, or by email. Emails are encrypted with a random
// IV, so they can't be matched in SQL; decrypt each one and compare instead.
async function findUserByIdentifier(identifier: string) {
  const byUsername = await storage.getUserByUsername(identifier);
  if (byUsername) return byUsername;

  const wanted = identifier.toLowerCase();
  const users = await storage.getAllUsers();
  return users.find((user) => user.email && safeDecrypt(user.email).toLowerCase() === wanted);
}

// User object safe to send to the browser: no password hash, fields decrypted
export function toPublicUser(user: SelectUser) {
  const { password, ...rest } = user;
  return {
    ...rest,
    email: safeDecrypt(user.email),
    fullName: safeDecrypt(user.fullName),
    bio: safeDecrypt(user.bio),
  };
}

export function setupAuth(app: Express) {
  if (!process.env.SESSION_SECRET) {
    // For security in production, this should come from environment variables
    process.env.SESSION_SECRET = randomBytes(32).toString("hex");
    console.warn("No SESSION_SECRET provided, using randomly generated secret");
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true, // Helps protect against XSS attacks
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport's local strategy; "identifier" is a username or an email
  passport.use(
    new LocalStrategy({ usernameField: "identifier" }, async (identifier, password, done) => {
      try {
        const user = await findUserByIdentifier(identifier);

        // If user not found or password doesn't match, return failure
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username/email or password" });
        }

        // Authentication successful, return user
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  // Serialize user to session
  passport.serializeUser((user, done) => done(null, user.id));

  // Deserialize user from session (a deleted user just ends the session)
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(null, false);
    }
  });

  // Register endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, email, fullName, bio } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check if username or email is already taken
      if (await storage.getUserByUsername(username)) {
        return res.status(400).json({ message: "Username already exists" });
      }
      if (email && (await findUserByIdentifier(email))) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password and encrypt personal data before storing
      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        email: email ? encryptData(email) : null,
        fullName: fullName ? encryptData(fullName) : null,
        bio: bio ? encryptData(bio) : null,
      });

      // Log the user in automatically after registration
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(toPublicUser(user));
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(200).json(toPublicUser(user));
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie("connect.sid");
        res.sendStatus(200);
      });
    });
  });

  // Get current user info
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(toPublicUser(req.user));
  });
}
