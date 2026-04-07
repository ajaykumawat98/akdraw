import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, real, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
}));

// Canvases table
export const canvases = pgTable('canvases', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  backgroundColor: varchar('background_color', { length: 7 }).default('#FFFFFF'),
  backgroundType: varchar('background_type', { length: 20 }).default('plain'),
  viewportX: real('viewport_x').default(0),
  viewportY: real('viewport_y').default(0),
  zoom: real('zoom').default(1),
  isPublic: boolean('is_public').default(false),
  isArchived: boolean('is_archived').default(false),
  version: integer('version').default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  ownerIdx: index('canvases_owner_idx').on(table.ownerId),
  updatedAtIdx: index('canvases_updated_idx').on(table.updatedAt),
}));

// Canvas objects (elements on the canvas)
export const canvasObjects = pgTable('canvas_objects', {
  id: uuid('id').primaryKey().defaultRandom(),
  canvasId: uuid('canvas_id').references(() => canvases.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  x: real('x').notNull(),
  y: real('y').notNull(),
  width: real('width'),
  height: real('height'),
  rotation: real('rotation').default(0),
  zIndex: integer('z_index').default(0),
  data: jsonb('data').notNull(),
  style: jsonb('style').default({}),
  groupId: uuid('group_id'),
  parentId: uuid('parent_id'),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean('is_deleted').default(false),
}, (table) => ({
  canvasIdx: index('objects_canvas_idx').on(table.canvasId),
  typeIdx: index('objects_type_idx').on(table.type),
  zIndexIdx: index('objects_zindex_idx').on(table.canvasId, table.zIndex),
}));

// Canvas collaborators
export const canvasCollaborators = pgTable('canvas_collaborators', {
  id: uuid('id').primaryKey().defaultRandom(),
  canvasId: uuid('canvas_id').references(() => canvases.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 20 }).default('editor').notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
}, (table) => ({
  canvasUserIdx: index('collab_canvas_user_idx').on(table.canvasId, table.userId),
  userIdx: index('collab_user_idx').on(table.userId),
}));

// Canvas versions (for history)
export const canvasVersions = pgTable('canvas_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  canvasId: uuid('canvas_id').references(() => canvases.id, { onDelete: 'cascade' }).notNull(),
  version: integer('version').notNull(),
  snapshot: jsonb('snapshot').notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  comment: text('comment'),
}, (table) => ({
  canvasVersionIdx: index('versions_canvas_idx').on(table.canvasId, table.version),
}));

// Tags
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull(),
  color: varchar('color', { length: 7 }).default('#4F46E5'),
  canvasId: uuid('canvas_id').references(() => canvases.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  canvasNameIdx: index('tags_canvas_name_idx').on(table.canvasId, table.name),
}));

// Object tags (many-to-many)
export const objectTags = pgTable('object_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  objectId: uuid('object_id').references(() => canvasObjects.id, { onDelete: 'cascade' }).notNull(),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
}, (table) => ({
  objectTagIdx: index('objtags_object_tag_idx').on(table.objectId, table.tagId),
}));

// Tree structure (CherryTree-style)
export const treeNodes = pgTable('tree_nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  canvasId: uuid('canvas_id').references(() => canvases.id, { onDelete: 'cascade' }).notNull(),
  parentId: uuid('parent_id'),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 20 }).default('group').notNull(),
  icon: varchar('icon', { length: 50 }),
  color: varchar('color', { length: 7 }),
  bookmarkX: real('bookmark_x'),
  bookmarkY: real('bookmark_y'),
  bookmarkZoom: real('bookmark_zoom'),
  frameObjectIds: jsonb('frame_object_ids').default([]),
  sortOrder: integer('sort_order').default(0),
  isExpanded: boolean('is_expanded').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  canvasIdx: index('tree_canvas_idx').on(table.canvasId),
  parentIdx: index('tree_parent_idx').on(table.parentId),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Canvas = typeof canvases.$inferSelect;
export type NewCanvas = typeof canvases.$inferInsert;
export type CanvasObject = typeof canvasObjects.$inferSelect;
export type NewCanvasObject = typeof canvasObjects.$inferInsert;
