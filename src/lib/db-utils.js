import { db } from './database.js';
import { randomUUID } from 'crypto';

// Helper function to generate UUID
export function generateId() {
  return randomUUID();
}

// Helper function to get current timestamp
export function getCurrentTimestamp() {
  return new Date().toISOString();
}

// Create a new poll
export function createPoll(pollData) {
  const pollId = generateId();
  const shareToken = generateId();
  
  const poll = db.prepare(`
    INSERT INTO polls (
      id, title, description, question, status, 
      allow_multiple_votes, max_votes_per_option, 
      created_by, expires_at, is_public, share_token
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    pollId,
    pollData.title,
    pollData.description || null,
    pollData.question,
    pollData.status || 'active',
    pollData.allow_multiple_votes ? 1 : 0,
    pollData.max_votes_per_option || 1,
    pollData.created_by || null,
    pollData.expires_at || null,
    pollData.is_public ? 1 : 0,
    shareToken
  );

  return { id: pollId, share_token: shareToken };
}

// Update a poll
export function updatePoll(pollData, userId) {
  // First verify the user owns this poll
  const existingPoll = db.prepare(`
    SELECT * FROM polls WHERE id = ? AND created_by = ?
  `).get(pollData.id, userId);

  if (!existingPoll) {
    throw new Error("Poll not found or you don't have permission to edit it");
  }

  const result = db.prepare(`
    UPDATE polls SET 
      title = ?, 
      description = ?, 
      question = ?, 
      allow_multiple_votes = ?, 
      max_votes_per_option = ?, 
      expires_at = ?, 
      is_public = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND created_by = ?
  `).run(
    pollData.title,
    pollData.description || null,
    pollData.question,
    pollData.allow_multiple_votes ? 1 : 0,
    pollData.max_votes_per_option || 1,
    pollData.expires_at || null,
    pollData.is_public ? 1 : 0,
    pollData.id,
    userId
  );

  return result;
}

// Delete a poll
export function deletePoll(pollId, userId) {
  // First verify the user owns this poll
  const existingPoll = db.prepare(`
    SELECT * FROM polls WHERE id = ? AND created_by = ?
  `).get(pollId, userId);

  if (!existingPoll) {
    throw new Error("Poll not found or you don't have permission to delete it");
  }

  // Delete the poll (cascade will handle options and votes)
  const result = db.prepare(`
    DELETE FROM polls WHERE id = ? AND created_by = ?
  `).run(pollId, userId);

  return result;
}

// Update poll options
export function updatePollOptions(pollId, options) {
  // Delete existing options
  db.prepare(`
    DELETE FROM poll_options WHERE poll_id = ?
  `).run(pollId);

  // Insert new options
  const insertOption = db.prepare(`
    INSERT INTO poll_options (id, poll_id, option_text, option_order)
    VALUES (?, ?, ?, ?)
  `);

  const insertMany = db.transaction((pollId, options) => {
    for (let i = 0; i < options.length; i++) {
      insertOption.run(generateId(), pollId, options[i], i);
    }
  });

  insertMany(pollId, options);
}

// Create poll options
export function createPollOptions(pollId, options) {
  const insertOption = db.prepare(`
    INSERT INTO poll_options (id, poll_id, option_text, option_order)
    VALUES (?, ?, ?, ?)
  `);

  const insertMany = db.transaction((pollId, options) => {
    for (let i = 0; i < options.length; i++) {
      insertOption.run(generateId(), pollId, options[i], i);
    }
  });

  insertMany(pollId, options);
}

// Get a poll with results
export function getPollWithResults(pollId) {
  const poll = db.prepare(`
    SELECT * FROM polls WHERE id = ?
  `).get(pollId);

  if (!poll) return null;

  const options = db.prepare(`
    SELECT 
      po.id,
      po.option_text,
      po.option_order,
      COUNT(v.id) as vote_count,
      CASE 
        WHEN (SELECT COUNT(*) FROM votes WHERE poll_id = ?) > 0 
        THEN ROUND((COUNT(v.id) * 100.0 / (SELECT COUNT(*) FROM votes WHERE poll_id = ?)), 2)
        ELSE 0 
      END as vote_percentage
    FROM poll_options po
    LEFT JOIN votes v ON po.id = v.option_id
    WHERE po.poll_id = ?
    GROUP BY po.id, po.option_text, po.option_order
    ORDER BY po.option_order
  `).all(pollId, pollId, pollId);

  const totalVotes = db.prepare(`
    SELECT COUNT(*) as count FROM votes WHERE poll_id = ?
  `).get(pollId);

  return {
    ...poll,
    total_votes: totalVotes.count,
    options: options
  };
}

// Get a poll with options (for editing)
export function getPollForEdit(pollId, userId) {
  const poll = db.prepare(`
    SELECT * FROM polls WHERE id = ? AND created_by = ?
  `).get(pollId, userId);

  if (!poll) return null;

  const options = db.prepare(`
    SELECT * FROM poll_options 
    WHERE poll_id = ? 
    ORDER BY option_order
  `).all(pollId);

  return {
    ...poll,
    options: options
  };
}

// Get all polls for a user
export function getUserPolls(userId) {
  const polls = db.prepare(`
    SELECT p.*, 
           COUNT(po.id) as option_count,
           COUNT(v.id) as total_votes
    FROM polls p
    LEFT JOIN poll_options po ON p.id = po.poll_id
    LEFT JOIN votes v ON p.id = v.poll_id
    WHERE p.created_by = ?
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `).all(userId);

  return polls;
}

// Submit votes
export function submitVotes(voteData) {
  const insertVote = db.prepare(`
    INSERT INTO votes (id, poll_id, option_id, voter_id, voter_email, voter_name)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((votes) => {
    for (const vote of votes) {
      insertVote.run(
        generateId(),
        vote.poll_id,
        vote.option_id,
        vote.voter_id || null,
        vote.voter_email || null,
        vote.voter_name || null
      );
    }
  });

  insertMany(voteData);
}

// Get poll by share token
export function getPollByShareToken(shareToken) {
  const poll = db.prepare(`
    SELECT * FROM polls 
    WHERE share_token = ? AND is_public = 1
  `).get(shareToken);

  if (!poll) return null;

  const options = db.prepare(`
    SELECT * FROM poll_options 
    WHERE poll_id = ? 
    ORDER BY option_order
  `).all(poll.id);

  return {
    ...poll,
    poll_options: options
  };
}

// Create or get user
export function createOrGetUser(email, name) {
  let user = db.prepare(`
    SELECT * FROM users WHERE email = ?
  `).get(email);

  if (!user) {
    const userId = generateId();
    db.prepare(`
      INSERT INTO users (id, email, name)
      VALUES (?, ?, ?)
    `).run(userId, email, name || email.split('@')[0]);

    user = { id: userId, email, name: name || email.split('@')[0] };
  }

  return user;
}

// Get user by email
export function getUserByEmail(email) {
  return db.prepare(`
    SELECT * FROM users WHERE email = ?
  `).get(email);
}
