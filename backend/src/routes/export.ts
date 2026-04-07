import { Router } from 'express';
import { db } from '../db';
import { canvases, canvasObjects } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import puppeteer from 'puppeteer';

const router = Router();

// Export canvas to PNG
router.get('/:canvasId/png', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const { canvasId } = req.params;
    const { 
      width = 1920, 
      height = 1080, 
      bg = 'white',
      scale = 2 
    } = req.query;
    
    const canvas = await db.query.canvases.findFirst({
      where: eq(canvases.id, canvasId),
    });
    
    if (!canvas) {
      res.status(404).json({ error: 'Canvas not found' });
      return;
    }
    
    // Check access
    if (!canvas.isPublic) {
      if (!req.user || req.user.userId !== canvas.ownerId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    }
    
    const objects = await db.query.canvasObjects.findMany({
      where: and(
        eq(canvasObjects.canvasId, canvasId),
        eq(canvasObjects.isDeleted, false)
      ),
    });
    
    // Generate HTML for rendering
    const html = generateCanvasHTML(canvas, objects, bg as string);
    
    // Launch puppeteer and capture screenshot
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    await page.setViewport({
      width: parseInt(width as string),
      height: parseInt(height as string),
      deviceScaleFactor: parseInt(scale as string),
    });
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Wait for canvas to render
    await page.waitForTimeout(1000);
    
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
    });
    
    await browser.close();
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${canvas.name}.png"`);
    res.send(screenshot);
  } catch (error) {
    next(error);
  }
});

// Export to Excalidraw format
router.get('/:canvasId/excalidraw', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const { canvasId } = req.params;
    
    const canvas = await db.query.canvases.findFirst({
      where: eq(canvases.id, canvasId),
    });
    
    if (!canvas) {
      res.status(404).json({ error: 'Canvas not found' });
      return;
    }
    
    if (!canvas.isPublic) {
      if (!req.user || req.user.userId !== canvas.ownerId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    }
    
    const objects = await db.query.canvasObjects.findMany({
      where: and(
        eq(canvasObjects.canvasId, canvasId),
        eq(canvasObjects.isDeleted, false)
      ),
    });
    
    const excalidrawData = convertToExcalidraw(canvas, objects);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${canvas.name}.excalidraw"`);
    res.json(excalidrawData);
  } catch (error) {
    next(error);
  }
});

// Export to JSON
router.get('/:canvasId/json', authMiddleware, async (req, res, next) => {
  try {
    const { canvasId } = req.params;
    const userId = req.user!.userId;
    
    const canvas = await db.query.canvases.findFirst({
      where: eq(canvases.id, canvasId),
    });
    
    if (!canvas || canvas.ownerId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const objects = await db.query.canvasObjects.findMany({
      where: eq(canvasObjects.canvasId, canvasId),
    });
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${canvas.name}.json"`);
    res.json({
      version: canvas.version,
      canvas,
      objects,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

function generateCanvasHTML(canvas: any, objects: any[], bg: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; background: ${bg}; }
    #canvas { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="canvas"></div>
  <script>
    // Simple canvas rendering for export
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.getElementById('canvas').appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = '${bg === 'transparent' ? 'rgba(0,0,0,0)' : canvas.backgroundColor}';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Render objects
    const objects = ${JSON.stringify(objects)};
    objects.forEach(obj => {
      ctx.save();
      ctx.translate(obj.x + (obj.width || 0) / 2, obj.y + (obj.height || 0) / 2);
      ctx.rotate((obj.rotation || 0) * Math.PI / 180);
      ctx.translate(-(obj.width || 0) / 2, -(obj.height || 0) / 2);
      
      if (obj.type === 'text') {
        ctx.font = '16px sans-serif';
        ctx.fillStyle = obj.style?.strokeColor || '#000';
        const text = obj.data.text || '';
        ctx.fillText(text, 0, 20);
      } else if (obj.type === 'shape') {
        ctx.strokeStyle = obj.style?.strokeColor || '#000';
        ctx.lineWidth = obj.style?.strokeWidth || 2;
        ctx.strokeRect(0, 0, obj.width || 100, obj.height || 100);
      }
      
      ctx.restore();
    });
  </script>
</body>
</html>
  `;
}

function convertToExcalidraw(canvas: any, objects: any[]) {
  const elements = objects.map(obj => {
    const base = {
      id: obj.id,
      x: obj.x,
      y: obj.y,
      width: obj.width || 100,
      height: obj.height || 100,
      angle: (obj.rotation || 0) * Math.PI / 180,
      strokeColor: obj.style?.strokeColor || '#000000',
      backgroundColor: obj.style?.fillColor || 'transparent',
      fillStyle: obj.style?.fillStyle || 'solid',
      strokeWidth: obj.style?.strokeWidth || 2,
      strokeStyle: obj.style?.strokeStyle || 'solid',
      roughness: obj.style?.roughness ?? 1,
      opacity: obj.style?.opacity ?? 100,
      groupIds: obj.groupId ? [obj.groupId] : [],
      frameId: null,
      roundness: null,
      seed: Math.floor(Math.random() * 100000),
      version: 1,
      versionNonce: Date.now(),
      isDeleted: obj.isDeleted,
      boundElements: null,
      updated: new Date(obj.updatedAt).getTime(),
      link: null,
      locked: false,
    };
    
    switch (obj.type) {
      case 'text':
        return {
          ...base,
          type: 'text',
          text: obj.data.text || '',
          fontSize: obj.style?.fontSize || 20,
          fontFamily: obj.style?.fontFamily === 'monospace' ? 3 : 1,
          textAlign: obj.style?.textAlign || 'left',
          verticalAlign: 'top',
          baseline: 18,
        };
      case 'shape':
        const shapeType = obj.data.shapeType || 'rectangle';
        if (shapeType === 'ellipse') {
          return { ...base, type: 'ellipse' };
        } else if (shapeType === 'diamond') {
          return { ...base, type: 'diamond' };
        } else {
          return { ...base, type: 'rectangle' };
        }
      case 'arrow':
        return {
          ...base,
          type: 'arrow',
          points: [
            [0, 0],
            [obj.width || 100, obj.height || 0],
          ],
          startBinding: null,
          endBinding: null,
          startArrowhead: obj.data.startArrowhead || null,
          endArrowhead: obj.data.endArrowhead || 'arrow',
        };
      default:
        return { ...base, type: 'rectangle' };
    }
  });
  
  return {
    type: 'excalidraw',
    version: 2,
    source: 'akdraw',
    elements,
    appState: {
      viewBackgroundColor: canvas.backgroundColor,
      zoom: { value: canvas.zoom || 1 },
      scrollX: canvas.viewportX || 0,
      scrollY: canvas.viewportY || 0,
    },
    files: {},
  };
}

export default router;
