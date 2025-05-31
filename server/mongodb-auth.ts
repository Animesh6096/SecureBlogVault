import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { mongoStorage } from "./mongodb-storage";
import { User, IUser } from "@shared/mongodb-schema";
import { encryptData, decryptData } from "./encryption";

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
function safeDecrypt(value: string) {
  try {
    if (typeof value === 'string' && value.length > 0 && value.includes('.')) {
      return decryptData(value);
    }
    return value;
  } catch (e) {
    return value;
  }
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
          // Fetch all users
          const users = await User.find();
          let foundUser = null;
          for (const user of users) {
            let decryptedUsername = safeDecrypt(user.username);
            let decryptedEmail = safeDecrypt(user.email);
            if (identifier === decryptedUsername || identifier === decryptedEmail) {
              foundUser = user;
              break;
            }
          }
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
      const existingUser = await mongoStorage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
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
        // Convert Mongoose document to plain object and remove sensitive data
        const userResponse = user.toObject();
        delete userResponse.password;
        // Decrypt before sending to frontend
        userResponse.email = userResponse.email ? decryptData(userResponse.email) : "";
        userResponse.bio = userResponse.bio ? decryptData(userResponse.bio) : "";
        userResponse.fullName = userResponse.fullName ? decryptData(userResponse.fullName) : "";
        res.status(201).json(userResponse);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    const userResponse = req.user.toObject();
    delete userResponse.password;
    // Decrypt before sending to frontend
    userResponse.email = userResponse.email ? decryptData(userResponse.email) : "";
    userResponse.bio = userResponse.bio ? decryptData(userResponse.bio) : "";
    userResponse.fullName = userResponse.fullName ? decryptData(userResponse.fullName) : "";
    res.status(200).json(userResponse);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) return res.sendStatus(401);
    // Convert Mongoose document to plain object and remove sensitive data
    const userResponse = req.user.toObject();
    delete userResponse.password;
    // Decrypt before sending to frontend
    userResponse.email = userResponse.email ? decryptData(userResponse.email) : "";
    userResponse.bio = userResponse.bio ? decryptData(userResponse.bio) : "";
    userResponse.fullName = userResponse.fullName ? decryptData(userResponse.fullName) : "";
    res.json(userResponse);
  });
}