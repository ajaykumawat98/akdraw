import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'akdraw',
  password: process.env.DB_PASSWORD || 'akdraw',
  database: process.env.DB_NAME || 'akdraw',
});

const db = drizzle(pool, { schema });

async function runMigration() {
  console.log('Running migrations...');
  
  try {
    // Create tables using raw SQL (for initial setup)
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        avatar_url TEXT,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

      -- Canvases table
      CREATE TABLE IF NOT EXISTS canvases (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        background_color VARCHAR(7) DEFAULT '#FFFFFF',
        background_type VARCHAR(20) DEFAULT 'plain',
        viewport_x REAL DEFAULT 0,
        viewport_y REAL DEFAULT 0,
        zoom REAL DEFAULT 1,
        is_public BOOLEAN DEFAULT FALSE,
        is_archived BOOLEAN DEFAULT FALSE,
        version INTEGER DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE INDEX IF NOT EXISTS canvases_owner_idx ON canvases(owner_id);
      CREATE INDEX IF NOT EXISTS canvases_updated_idx ON canvases(updated_at);

      -- Canvas objects table
      CREATE TABLE IF NOT EXISTS canvas_objects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        canvas_id UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        x REAL NOT NULL,
        y REAL NOT NULL,
        width REAL,
        height REAL,
        rotation REAL DEFAULT 0,
        z_index INTEGER DEFAULT 0,
        data JSONB NOT NULL,
        style JSONB DEFAULT '{}',
        group_id UUID,
        parent_id UUID,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE
      );

      CREATE INDEX IF NOT EXISTS objects_canvas_idx ON canvas_objects(canvas_id);
      CREATE INDEX IF NOT EXISTS objects_type_idx ON canvas_objects(type);
      CREATE INDEX IF NOT EXISTS objects_zindex_idx ON canvas_objects(canvas_id, z_index);

      -- Canvas collaborators table
      CREATE TABLE IF NOT EXISTS canvas_collaborators (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        canvas_id UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'editor' NOT NULL,
        joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        last_active_at TIMESTAMPTZ,
        UNIQUE(canvas_id, user_id)
      );

      CREATE INDEX IF NOT EXISTS collab_canvas_user_idx ON canvas_collaborators(canvas_id, user_id);
      CREATE INDEX IF NOT EXISTS collab_user_idx ON canvas_collaborators(user_id);

      -- Canvas versions table
      CREATE TABLE IF NOT EXISTS canvas_versions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        canvas_id UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
        version INTEGER NOT NULL,
        snapshot JSONB NOT NULL,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        comment TEXT
      );

      CREATE INDEX IF NOT EXISTS versions_canvas_idx ON canvas_versions(canvas_id, version);

      -- Tags table
      CREATE TABLE IF NOT EXISTS tags (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(50) NOT NULL,
        color VARCHAR(7) DEFAULT '#4F46E5',
        canvas_id UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE INDEX IF NOT EXISTS tags_canvas_name_idx ON tags(canvas_id, name);

      -- Object tags table
      CREATE TABLE IF NOT EXISTS object_tags (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        object_id UUID NOT NULL REFERENCES canvas_objects(id) ON DELETE CASCADE,
        tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        UNIQUE(object_id, tag_id)
      );

      CREATE INDEX IF NOT EXISTS objtags_object_tag_idx ON object_tags(object_id, tag_id);

      -- Tree nodes table
      CREATE TABLE IF NOT EXISTS tree_nodes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        canvas_id UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
        parent_id UUID REFERENCES tree_nodes(id),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(20) DEFAULT 'group' NOT NULL,
        icon VARCHAR(50),
        color VARCHAR(7),
        bookmark_x REAL,
        bookmark_y REAL,
        bookmark_zoom REAL,
        frame_object_ids JSONB DEFAULT '[]',
        sort_order INTEGER DEFAULT 0,
        is_expanded BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE INDEX IF NOT EXISTS tree_canvas_idx ON tree_nodes(canvas_id);
      CREATE INDEX IF NOT EXISTS tree_parent_idx ON tree_nodes(parent_id);
    `);

    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
