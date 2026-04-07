import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register
router.post('/register', authRateLimiter, async (req, res, next) => {
  try {
    const { email, password, displayName } = registerSchema.parse(req.body);
    
    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    
    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }
    
    // Hash password and create user
    const passwordHash = await hashPassword(password);
    
    const [newUser] = await db.insert(users).values({
      email,
      passwordHash,
      displayName,
    }).returning({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
    });
    
    // Generate token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      displayName: newUser.displayName,
    });
    
    res.status(201).json({
      user: newUser,
      token,
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', authRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    // Verify password
    const isValid = await comparePassword(password, user.passwordHash);
    
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
    });
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.userId),
      columns: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
