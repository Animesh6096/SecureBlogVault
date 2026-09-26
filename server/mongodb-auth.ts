import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { mongoStorage } from "./mongodb-storage.js";
import { User, IUser } from "../shared/mongodb-schema.js";
import { encryptData, decryptData } from "./encryption.js";

declare global {
  namespace Express {
    interface User extends IUser {
      // Add any additional properties needed
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Helper to safely decrypt, fallback to original value if not decryptable
// (seeded records store some fields in plaintext)
export function safeDecrypt(value: string) {
  try {
    if (typeof value === 'string' && value.split('.').length === 3) {
      return decryptData(value);
    }
    return value;
  } catch (e) {
    return value;
  }
}

// Username and email are encrypted with a random IV, so they can't be queried
// directly; decrypt each user and compare instead.
async function findUserByIdentifier(...identifiers: (string | undefined)[]) {
  const wanted = identifiers.filter(Boolean);
  const users = await User.find();
  for (const user of users) {
    if (wanted.includes(safeDecrypt(user.username)) || wanted.includes(safeDecrypt(user.email))) {
      return user;
    }
  }
  return null;
}

// Plain user object for the frontend: no password, encrypted fields decrypted
function toPublicUser(user: any) {
  const userResponse = user.toObject();
  delete userResponse.password;
  userResponse.username = userResponse.username ? safeDecrypt(userResponse.username) : "";
  userResponse.email = userResponse.email ? safeDecrypt(userResponse.email) : "";
  userResponse.bio = userResponse.bio ? safeDecrypt(userResponse.bio) : "";
  userResponse.fullName = userResponse.fullName ? safeDecrypt(userResponse.fullName) : "";
  return userResponse;
}

export function setupMongoDBAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'secure-blog-secret',
    resave: false,
    saveUninitialized: false,
    store: mongoStorage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "identifier" },
      async (identifier, password, done) => {
        try {
          const foundUser = await findUserByIdentifier(identifier);
          if (!foundUser || !(await comparePasswords(password, foundUser.password))) {
            return done(null, false);
          } else {
            return done(null, foundUser);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await mongoStorage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await findUserByIdentifier(req.body.username, req.body.email);
      if (existingUser) {
        return res.status(400).json({ message: "Username or email already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      
      const encryptedUsername = req.body.username ? encryptData(req.body.username) : undefined;
      const encryptedEmail = req.body.email ? encryptData(req.body.email) : undefined;
      const encryptedBio = req.body.bio ? encryptData(req.body.bio) : undefined;
      const encryptedFullName = req.body.fullName ? encryptData(req.body.fullName) : undefined;
      const user = await mongoStorage.createUser({
        ...req.body,
        username: encryptedUsername,
        password: hashedPassword,
        email: encryptedEmail,
        bio: encryptedBio,
        fullName: encryptedFullName || "",
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(toPublicUser(user));
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    res.status(200).json(toPublicUser(req.user));
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) return res.sendStatus(401);
    res.json(toPublicUser(req.user));
  });
}