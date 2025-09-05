import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database file in the project root
const dbPath = path.join(process.cwd(), 'polls.db');
const db = new Database(dbPath);


/**
 * Initialize the SQLite database with all required tables and indexes.
 * Ensures schema for polls, options, votes, and users is present.
 * Handles edge cases for unique constraints and foreign keys.
 */
export function initializeDatabase() {
  try {
    // Polls table: stores poll metadata and settings
    db.exec(`
      CREATE TABLE IF NOT EXISTS polls (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        question TEXT NOT NULL,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
        allow_multiple_votes INTEGER DEFAULT 0,
        max_votes_per_option INTEGER DEFAULT 1,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        is_public INTEGER DEFAULT 1,
        share_token TEXT UNIQUE
      )
    `);

    // Poll options table: stores possible answers for each poll
    db.exec(`
      CREATE TABLE IF NOT EXISTS poll_options (
        id TEXT PRIMARY KEY,
        poll_id TEXT NOT NULL,
        option_text TEXT NOT NULL,
        option_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (poll_id) REFERENCES polls (id) ON DELETE CASCADE
      )
    `);

    // Votes table: records each user's vote, enforces uniqueness per poll/option/user/email
    db.exec(`
      CREATE TABLE IF NOT EXISTS votes (
        id TEXT PRIMARY KEY,
        poll_id TEXT NOT NULL,
        option_id TEXT NOT NULL,
        voter_id TEXT,
        voter_email TEXT,
        voter_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (poll_id) REFERENCES polls (id) ON DELETE CASCADE,
        FOREIGN KEY (option_id) REFERENCES poll_options (id) ON DELETE CASCADE,
        UNIQUE(poll_id, option_id, voter_id), -- Prevent duplicate votes by user
        UNIQUE(poll_id, option_id, voter_email) -- Prevent duplicate votes by email
      )
    `);

    // Users table: simple authentication for poll creators and voters
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indexes for query performance
    db.exec('CREATE INDEX IF NOT EXISTS idx_polls_created_by ON polls(created_by)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_polls_status ON polls(status)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_polls_share_token ON polls(share_token)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_votes_option_id ON votes(option_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON votes(voter_id)');

    console.log('Database initialized successfully');
  } catch (error) {
    // Log errors for troubleshooting
    console.error('Error initializing database:', error);
  }
}

// Initialize database on import
initializeDatabase();

export { db };
