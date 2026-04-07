import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { canvasObjects, canvases, canvasCollaborators } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import type { CanvasObjectData } from '../types';

const router = Router({ mergeParams: true });

const objectDataSchema = z.object({
  type: z.enum(['text', 'shape', 'arrow', 'image', 'table', 'ink', 'frame']),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  rotation: z.number().default(0),
  data: z.record(z.any()),
  style: z.record(z.any()).optional(),
});

const bulkUpdateSchema = z.array(z.object({
  id: z.string().uuid(),
  updates: z.record(z.any()),
}));

router.use(authMiddleware);

// Check canvas access middleware
async function checkCanvasAccess(canvasId: string, userId: string, requireEdit: boolean = false) {
  const canvas = await db.query.canvases.findFirst({
    where: eq(canvases.id, canvasId),
  });
  
  if (!canvas) return { allowed: false, error: 'Canvas not found' };
  
  const isOwner = canvas.ownerId === userId;
  if (isOwner) return { allowed: true, role: 'owner', canvas };
  
  if (canvas.isPublic && !requireEdit) {
    return { allowed: true, role: 'viewer', canvas };
  }
  
  const collab = await db.query.canvasCollaborators.findFirst({
    where: and(
      eq(canvasCollaborators.canvasId, canvasId),
      eq(canvasCollaborators.userId, userId)
    ),
  });
  
  if (!collab) return { allowed: false, error: 'Access denied' };
  if (requireEdit && collab.role === 'viewer') {
    return { allowed: false, error: 'Edit access required' };
  }
  
  return { allowed: true, role: collab.role, canvas };
}

// Create object
router.post('/', async (req, res, next) => {
  try {
    const { canvasId } = req.params;
    const userId = req.user!.userId;
    const data = objectDataSchema.parse(req.body);
    
    const access = await checkCanvasAccess(canvasId, userId, true);
    if (!access.allowed) {
      res.status(403).json({ error: access.error });
      return;
    }
    
    // Get max z-index
    const existingObjects = await db.query.canvasObjects.findMany({
      where: eq(canvasObjects.canvasId, canvasId),
      orderBy: (objects, { desc }) => [desc(objects.zIndex)],
      limit: 1,
    });
    
    const zIndex = (existingObjects[0]?.zIndex || 0) + 1;
    
    const [object] = await db.insert(canvasObjects).values({
      canvasId,
      type: data.type,
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
      rotation: data.rotation,
      zIndex,
      data: data.data,
      style: data.style || {},
      createdBy: userId,
      updatedBy: userId,
    }).returning();
    
    res.status(201).json({ object });
  } catch (error) {
    next(error);
  }
});

// Bulk create/update objects
router.post('/bulk', async (req, res, next) => {
  try {
    const { canvasId } = req.params;
    const userId = req.user!.userId;
    const { creates, updates, deletes } = req.body;
    
    const access = await checkCanvasAccess(canvasId, userId, true);
    if (!access.allowed) {
      res.status(403).json({ error: access.error });
      return;
    }
    
    const results = {
      created: [] as typeof canvasObjects.$inferSelect[],
      updated: [] as typeof canvasObjects.$inferSelect[],
      deleted: [] as string[],
    };
    
    // Handle creates
    if (creates && creates.length > 0) {
      for (const create of creates) {
        const [obj] = await db.insert(canvasObjects).values({
          canvasId,
          type: create.type,
          x: create.x,
          y: create.y,
          width: create.width,
          height: create.height,
          rotation: create.rotation || 0,
          zIndex: create.zIndex,
          data: create.data,
          style: create.style || {},
          createdBy: userId,
          updatedBy: userId,
        }).returning();
        results.created.push(obj);
      }
    }
    
    // Handle updates
    if (updates && updates.length > 0) {
      for (const update of updates) {
        const [obj] = await db.update(canvasObjects)
          .set({
            ...update.updates,
            updatedBy: userId,
            updatedAt: new Date(),
          })
          .where(and(
            eq(canvasObjects.id, update.id),
            eq(canvasObjects.canvasId, canvasId)
          ))
          .returning();
        if (obj) results.updated.push(obj);
      }
    }
    
    // Handle deletes (soft delete)
    if (deletes && deletes.length > 0) {
      await db.update(canvasObjects)
        .set({ isDeleted: true, updatedBy: userId, updatedAt: new Date() })
        .where(and(
          inArray(canvasObjects.id, deletes),
          eq(canvasObjects.canvasId, canvasId)
        ));
      results.deleted = deletes;
    }
    
    // Update canvas version
    await db.update(canvases)
      .set({ 
        version: (access.canvas!.version || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(canvases.id, canvasId));
    
    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Update object
router.patch('/:objectId', async (req, res, next) => {
  try {
    const { canvasId, objectId } = req.params;
    const userId = req.user!.userId;
    
    const access = await checkCanvasAccess(canvasId, userId, true);
    if (!access.allowed) {
      res.status(403).json({ error: access.error });
      return;
    }
    
    const [object] = await db.update(canvasObjects)
      .set({
        ...req.body,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(and(
        eq(canvasObjects.id, objectId),
        eq(canvasObjects.canvasId, canvasId)
      ))
      .returning();
    
    if (!object) {
      res.status(404).json({ error: 'Object not found' });
      return;
    }
    
    res.json({ object });
  } catch (error) {
    next(error);
  }
});

// Delete object
router.delete('/:objectId', async (req, res, next) => {
  try {
    const { canvasId, objectId } = req.params;
    const userId = req.user!.userId;
    
    const access = await checkCanvasAccess(canvasId, userId, true);
    if (!access.allowed) {
      res.status(403).json({ error: access.error });
      return;
    }
    
    await db.update(canvasObjects)
      .set({ 
        isDeleted: true,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(and(
        eq(canvasObjects.id, objectId),
        eq(canvasObjects.canvasId, canvasId)
      ));
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
