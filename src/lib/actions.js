"use server";

import { revalidatePath } from "next/cache";

// Dynamic imports for database functions
async function getDbUtils() {
  const { 
    createPoll, 
    createPollOptions, 
    getPollWithResults, 
    getUserPolls, 
    submitVotes, 
    getPollByShareToken,
    createOrGetUser,
    getUserByEmail,
    deletePoll,
    updatePoll,
    updatePollOptions,
    getPollForEdit
  } = await import('./db-utils.js');
  
  return {
    createPoll, 
    createPollOptions, 
    getPollWithResults, 
    getUserPolls, 
    submitVotes, 
    getPollByShareToken,
    createOrGetUser,
    getUserByEmail,
    deletePoll,
    updatePoll,
    updatePollOptions,
    getPollForEdit
  };
}

// Create a new poll
export async function createPollAction(formData) {
  try {
    const title = formData.get("title");
    const description = formData.get("description");
    const question = formData.get("question");
    const options = formData.getAll("options").filter(Boolean);
    const allowMultipleVotes = formData.get("allowMultipleVotes") === "true";
    const maxVotesPerOption = parseInt(formData.get("maxVotesPerOption")) || 1;
    const expiresAt = formData.get("expiresAt") || null;
    const isPublic = formData.get("isPublic") !== "false";
    const userEmail = formData.get("userEmail") || "anonymous@example.com";
    const userName = formData.get("userName") || "Anonymous User";

    // Validate required fields
    if (!title || !question || options.length < 2) {
      throw new Error("Title, question, and at least 2 options are required");
    }

    const { createPoll, createPollOptions, createOrGetUser } = await getDbUtils();

    // Create or get user
    const user = createOrGetUser(userEmail, userName);

    // Create the poll
    const pollData = {
      title,
      description,
      question,
      allow_multiple_votes: allowMultipleVotes,
      max_votes_per_option: maxVotesPerOption,
      expires_at: expiresAt,
      is_public: isPublic,
      created_by: user.id,
    };

    const { id: pollId } = createPoll(pollData);

    // Create poll options
    createPollOptions(pollId, options);

    revalidatePath("/polls");
    
    // Return success instead of redirecting
    return { success: true, pollId };
  } catch (error) {
    console.error("Error creating poll:", error);
    throw error;
  }
}

// Get poll for editing
export async function getPollForEditAction(pollId, userEmail) {
  try {
    const { getPollForEdit, getUserByEmail } = await getDbUtils();
    
    const user = getUserByEmail(userEmail);
    if (!user) {
      throw new Error("User not found");
    }

    const poll = getPollForEdit(pollId, user.id);
    
    if (!poll) {
      throw new Error("Poll not found or you don't have permission to edit it");
    }

    return poll;
  } catch (error) {
    console.error("Error fetching poll for edit:", error);
    throw error;
  }
}

// Update a poll
export async function updatePollAction(formData) {
  try {
    const pollId = formData.get("pollId");
    const title = formData.get("title");
    const description = formData.get("description");
    const question = formData.get("question");
    const options = formData.getAll("options").filter(Boolean);
    const allowMultipleVotes = formData.get("allowMultipleVotes") === "true";
    const maxVotesPerOption = parseInt(formData.get("maxVotesPerOption")) || 1;
    const expiresAt = formData.get("expiresAt") || null;
    const isPublic = formData.get("isPublic") !== "false";
    const userEmail = formData.get("userEmail");

    // Validate required fields
    if (!pollId || !title || !question || options.length < 2) {
      throw new Error("Poll ID, title, question, and at least 2 options are required");
    }

    const { updatePoll, updatePollOptions, getUserByEmail } = await getDbUtils();

    // Verify user owns the poll
    const user = getUserByEmail(userEmail);
    if (!user) {
      throw new Error("User not found");
    }

    // Update the poll
    const pollData = {
      id: pollId,
      title,
      description,
      question,
      allow_multiple_votes: allowMultipleVotes,
      max_votes_per_option: maxVotesPerOption,
      expires_at: expiresAt,
      is_public: isPublic,
    };

    updatePoll(pollData, user.id);
    updatePollOptions(pollId, options);

    revalidatePath("/polls");
    revalidatePath(`/polls/${pollId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error updating poll:", error);
    throw error;
  }
}

// Delete a poll
export async function deletePollAction(formData) {
  try {
    const pollId = formData.get("pollId");
    const userEmail = formData.get("userEmail");

    if (!pollId) {
      throw new Error("Poll ID is required");
    }

    const { deletePoll, getUserByEmail } = await getDbUtils();

    // Verify user owns the poll
    const user = getUserByEmail(userEmail);
    if (!user) {
      throw new Error("User not found");
    }

    deletePoll(pollId, user.id);

    revalidatePath("/polls");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting poll:", error);
    throw error;
  }
}

// Get a poll with results
export async function getPollAction(pollId) {
  try {
    const { getPollWithResults } = await getDbUtils();
    const poll = getPollWithResults(pollId);
    
    if (!poll) {
      throw new Error("Poll not found");
    }

    return poll;
  } catch (error) {
    console.error("Error fetching poll:", error);
    throw error;
  }
}

// Get all polls for a user
export async function getUserPollsAction(userEmail) {
  try {
    const { getUserPolls, getUserByEmail } = await getDbUtils();
    const user = getUserByEmail(userEmail);
    
    if (!user) {
      return [];
    }

    const polls = getUserPolls(user.id);
    return polls;
  } catch (error) {
    console.error("Error fetching user polls:", error);
    return [];
  }
}

// Submit a vote
export async function submitVoteAction(formData) {
  try {
    const pollId = formData.get("pollId");
    const optionIds = formData.getAll("optionIds");
    const voterEmail = formData.get("voterEmail");
    const voterName = formData.get("voterName");

    if (!pollId || optionIds.length === 0) {
      throw new Error("Poll ID and at least one option are required");
    }

    const { submitVotes, createOrGetUser } = await getDbUtils();

    // Create or get voter user
    const voter = createOrGetUser(voterEmail || "anonymous@example.com", voterName || "Anonymous");

    // Create votes for each selected option
    const votes = optionIds.map(optionId => ({
      poll_id: pollId,
      option_id: optionId,
      voter_id: voter.id,
      voter_email: voterEmail || null,
      voter_name: voterName || null,
    }));

    submitVotes(votes);

    revalidatePath(`/polls/${pollId}`);
    return { success: true };
  } catch (error) {
    console.error("Error submitting vote:", error);
    throw error;
  }
}

// Get poll by share token
export async function getPollByShareTokenAction(shareToken) {
  try {
    const { getPollByShareToken } = await getDbUtils();
    const poll = getPollByShareToken(shareToken);
    
    if (!poll) {
      throw new Error("Poll not found or not public");
    }

    return poll;
  } catch (error) {
    console.error("Error fetching poll by share token:", error);
    throw error;
  }
}

// Simple authentication functions
export async function signInAction(formData) {
  try {
    const email = formData.get("email");
    const password = formData.get("password"); // We'll ignore password for simplicity

    if (!email) {
      throw new Error("Email is required");
    }

    const { createOrGetUser } = await getDbUtils();
    const user = createOrGetUser(email, email.split('@')[0]);
    return { user };
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

export async function signUpAction(formData) {
  try {
    const email = formData.get("email");
    const name = formData.get("name");
    const password = formData.get("password"); // We'll ignore password for simplicity

    if (!email) {
      throw new Error("Email is required");
    }

    const { createOrGetUser } = await getDbUtils();
    const user = createOrGetUser(email, name || email.split('@')[0]);
    return { user };
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
}
