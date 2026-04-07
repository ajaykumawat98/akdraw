import { Server as SocketServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { db } from '../db';
import { canvases, canvasCollaborators, canvasObjects } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '../utils/jwt';
import type { WebSocketMessage, CursorPosition } from '../types';

interface SocketUser {
  userId: string;
  displayName: string;
  email: string;
  socketId: string;
  color: string;
}

interface CanvasRoom {
  canvasId: string;
  users: Map<string, SocketUser>; // socketId -> user
  cursors: Map<string, CursorPosition>;
}

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
];

export class WebSocketService {
  private io: SocketServer;
  private rooms: Map<string, CanvasRoom> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.setupHandlers();
  }

  private setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Authenticate socket
      socket.on('authenticate', (token: string) => {
        try {
          const payload = verifyToken(token);
          socket.data.user = payload;
          socket.emit('authenticated', { success: true, user: payload });
        } catch {
          socket.emit('authenticated', { success: false, error: 'Invalid token' });
        }
      });

      // Join canvas room
      socket.on('join_canvas', async (canvasId: string) => {
        try {
          const user = socket.data.user;
          if (!user) {
            socket.emit('error', { message: 'Not authenticated' });
            return;
          }

          // Check access
          const canvas = await db.query.canvases.findFirst({
            where: eq(canvases.id, canvasId),
          });

          if (!canvas) {
            socket.emit('error', { message: 'Canvas not found' });
            return;
          }

          const isOwner = canvas.ownerId === user.userId;
          let role = 'viewer';

          if (!isOwner && !canvas.isPublic) {
            const collab = await db.query.canvasCollaborators.findFirst({
              where: and(
                eq(canvasCollaborators.canvasId, canvasId),
                eq(canvasCollaborators.userId, user.userId)
              ),
            });
            if (!collab) {
              socket.emit('error', { message: 'Access denied' });
              return;
            }
            role = collab.role;
          } else if (isOwner) {
            role = 'owner';
          }

          // Leave previous rooms
          socket.rooms.forEach((room) => {
            if (room !== socket.id) {
              socket.leave(room);
            }
          });

          // Join new room
          socket.join(canvasId);

          // Get or create room
          if (!this.rooms.has(canvasId)) {
            this.rooms.set(canvasId, {
              canvasId,
              users: new Map(),
              cursors: new Map(),
            });
          }

          const room = this.rooms.get(canvasId)!;
          const color = colors[room.users.size % colors.length];

          const socketUser: SocketUser = {
            userId: user.userId,
            displayName: user.displayName,
            email: user.email,
            socketId: socket.id,
            color,
          };

          room.users.set(socket.id, socketUser);

          // Update last active
          await db.update(canvasCollaborators)
            .set({ lastActiveAt: new Date() })
            .where(and(
              eq(canvasCollaborators.canvasId, canvasId),
              eq(canvasCollaborators.userId, user.userId)
            ));

          // Send current users to new member
          const roomUsers = Array.from(room.users.values()).map(u => ({
            userId: u.userId,
            displayName: u.displayName,
            color: u.color,
            socketId: u.socketId,
          }));

          socket.emit('joined_canvas', {
            canvasId,
            role,
            users: roomUsers,
            cursors: Array.from(room.cursors.values()),
          });

          // Notify others
          socket.to(canvasId).emit('user_joined', {
            user: {
              userId: socketUser.userId,
              displayName: socketUser.displayName,
              color: socketUser.color,
              socketId: socket.id,
            },
          });

          console.log(`User ${user.displayName} joined canvas ${canvasId}`);
        } catch (error) {
          console.error('Error joining canvas:', error);
          socket.emit('error', { message: 'Failed to join canvas' });
        }
      });

      // Cursor position
      socket.on('cursor_move', (data: { canvasId: string; x: number; y: number }) => {
        const room = this.rooms.get(data.canvasId);
        const user = room?.users.get(socket.id);
        
        if (room && user) {
          const cursor: CursorPosition = {
            x: data.x,
            y: data.y,
            userId: user.userId,
            userName: user.displayName,
            color: user.color,
          };
          
          room.cursors.set(socket.id, cursor);
          socket.to(data.canvasId).emit('cursor_update', cursor);
        }
      });

      // Object operations
      socket.on('object_create', async (data: { canvasId: string; object: any }) => {
        try {
          const user = socket.data.user;
          if (!user) return;

          // Broadcast to others
          socket.to(data.canvasId).emit('object_created', {
            object: data.object,
            createdBy: user.userId,
          });
        } catch (error) {
          console.error('Error creating object:', error);
        }
      });

      socket.on('object_update', async (data: { canvasId: string; objectId: string; updates: any }) => {
        try {
          const user = socket.data.user;
          if (!user) return;

          // Broadcast to others
          socket.to(data.canvasId).emit('object_updated', {
            objectId: data.objectId,
            updates: data.updates,
            updatedBy: user.userId,
          });
        } catch (error) {
          console.error('Error updating object:', error);
        }
      });

      socket.on('object_delete', async (data: { canvasId: string; objectId: string }) => {
        try {
          const user = socket.data.user;
          if (!user) return;

          socket.to(data.canvasId).emit('object_deleted', {
            objectId: data.objectId,
            deletedBy: user.userId,
          });
        } catch (error) {
          console.error('Error deleting object:', error);
        }
      });

      // Bulk operations
      socket.on('bulk_operation', (data: { 
        canvasId: string; 
        creates?: any[]; 
        updates?: any[]; 
        deletes?: string[];
      }) => {
        const user = socket.data.user;
        if (!user) return;

        socket.to(data.canvasId).emit('bulk_updated', {
          ...data,
          updatedBy: user.userId,
        });
      });

      // Selection
      socket.on('selection_change', (data: { canvasId: string; objectIds: string[] }) => {
        const room = this.rooms.get(data.canvasId);
        const user = room?.users.get(socket.id);
        
        if (user) {
          socket.to(data.canvasId).emit('selection_changed', {
            userId: user.userId,
            userName: user.displayName,
            color: user.color,
            objectIds: data.objectIds,
          });
        }
      });

      // Chat
      socket.on('chat_message', (data: { canvasId: string; message: string; x?: number; y?: number }) => {
        const user = socket.data.user;
        if (!user) return;

        this.io.to(data.canvasId).emit('chat_message', {
          userId: user.userId,
          userName: user.displayName,
          message: data.message,
          x: data.x,
          y: data.y,
          timestamp: Date.now(),
        });
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Remove from all rooms
        this.rooms.forEach((room, canvasId) => {
          if (room.users.has(socket.id)) {
            const user = room.users.get(socket.id);
            room.users.delete(socket.id);
            room.cursors.delete(socket.id);
            
            socket.to(canvasId).emit('user_left', {
              userId: user?.userId,
              socketId: socket.id,
            });

            // Clean up empty rooms
            if (room.users.size === 0) {
              this.rooms.delete(canvasId);
            }
          }
        });
      });
    });
  }

  public broadcastToCanvas(canvasId: string, event: string, data: any) {
    this.io.to(canvasId).emit(event, data);
  }
}
