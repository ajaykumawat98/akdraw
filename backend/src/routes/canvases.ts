import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { canvases, canvasObjects, canvasCollaborators, tags, treeNodes } from '../db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const createCanvasSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  backgroundColor: z.string().default('#FFFFFF'),
  backgroundType: z.enum(['plain', 'dot', 'line', 'dark', 'blueprint']).default('plain'),
});

const updateCanvasSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  backgroundColor: z.string().optional(),
  backgroundType: z.enum(['plain', 'dot', 'line', 'dark', 'blueprint']).optional(),
  viewportX: z.number().optional(),
  viewportY: z.number().optional(),
  zoom: z.number().optional(),
  isPublic: z.boolean().optional(),
});

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all canvases for user
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    
    const userCanvases = await db.query.canvases.findMany({
      where: and(
        eq(canvases.ownerId, userId),
        eq(canvases.isArchived, false)
      ),
      orderBy: desc(canvases.updatedAt),
    });
    
    // Also get canvases where user is a collaborator
    const collaborations = await db.query.canvasCollaborators.findMany({
      where: eq(canvasCollaborators.userId, userId),
      with: {
        canvas: true,
      },
    });
    
    const collabCanvases = collaborations
      .map(c => c.canvas)
      .filter(c => !c.isArchived);
    
    res.json({
      owned: userCanvases,
      collaborations: collabCanvases,
    });
  } catch (error) {
    next(error);
  }
});

// Create canvas
router.post('/', async (req, res, next) => {
  try {
    const data = createCanvasSchema.parse(req.body);
    const userId = req.user!.userId;
    
    const [canvas] = await db.insert(canvases).values({
      ...data,
      ownerId: userId,
    }).returning();
    
    res.status(201).json({ canvas });
  } catch (error) {
    next(error);
  }
});

// Get single canvas with objects
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    const canvas = await db.query.canvases.findFirst({
      where: eq(canvases.id, id),
      with: {
        owner: {
          columns: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
    
    if (!canvas) {
      res.status(404).json({ error: 'Canvas not found' });
      return;
    }
    
    // Check access
    const isOwner = canvas.ownerId === userId;
    const isPublic = canvas.isPublic;
    
    if (!isOwner && !isPublic) {
      // Check if collaborator
      const collab = await db.query.canvasCollaborators.findFirst({
        where: and(
          eq(canvasCollaborators.canvasId, id),
          eq(canvasCollaborators.userId, userId)
        ),
      });
      
      if (!collab) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    }
    
    // Get objects
    const objects = await db.query.canvasObjects.findMany({
      where: and(
        eq(canvasObjects.canvasId, id),
        eq(canvasObjects.isDeleted, false)
      ),
      orderBy: canvasObjects.zIndex,
    });
    
    // Get tags
    const canvasTags = await db.query.tags.findMany({
      where: eq(tags.canvasId, id),
    });
    
    // Get tree nodes
    const nodes = await db.query.treeNodes.findMany({
      where: eq(treeNodes.canvasId, id),
      orderBy: treeNodes.sortOrder,
    });
    
    res.json({
      canvas,
      objects,
      tags: canvasTags,
      treeNodes: nodes,
    });
  } catch (error) {
    next(error);
  }
});

// Update canvas
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updateCanvasSchema.parse(req.body);
    const userId = req.user!.userId;
    
    // Check ownership or edit permission
    const canvas = await db.query.canvases.findFirst({
      where: eq(canvases.id, id),
    });
    
    if (!canvas) {
      res.status(404).json({ error: 'Canvas not found' });
      return;
    }
    
    const isOwner = canvas.ownerId === userId;
    
    if (!isOwner) {
      const collab = await db.query.canvasCollaborators.findFirst({
        where: and(
          eq(canvasCollaborators.canvasId, id),
          eq(canvasCollaborators.userId, userId)
        ),
      });
      
      if (!collab || collab.role === 'viewer') {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    }
    
    const [updated] = await db.update(canvases)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(canvases.id, id))
      .returning();
    
    res.json({ canvas: updated });
  } catch (error) {
    next(error);
  }
});

// Delete canvas
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    const canvas = await db.query.canvases.findFirst({
      where: eq(canvases.id, id),
    });
    
    if (!canvas || canvas.ownerId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    await db.delete(canvases).where(eq(canvases.id, id));
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
