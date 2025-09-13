"use client";

/**
 * Casts a vote on a poll.
 *
 * @param {string} pollId - The ID of the poll.
 * @param {string[]} optionIds - An array of selected option IDs.
 * @param {string} [voterEmail] - The email of the voter (optional).
 * @param {string} [voterName] - The name of the voter (optional).
 * @returns {Promise<{success: boolean}>} - A promise that resolves to an object indicating the success of the vote.
 */
export async function castVote(pollId, optionIds, voterEmail, voterName) {
  try {
    const formData = new FormData();
    formData.append("pollId", pollId);
    optionIds.forEach(optionId => {
      formData.append("optionIds", optionId);
    });

    if (voterEmail) {
      formData.append("voterEmail", voterEmail);
    }
    if (voterName) {
      formData.append("voterName", voterName);
    }

    const { submitVoteAction } = await import("@/lib/actions");
    return await submitVoteAction(formData);
  } catch (error) {
    console.error("Error casting vote:", error);
    throw new Error("Failed to cast vote: " + error.message);
  }
}

/**
 * Retrieves the results of a poll.
 *
 * @param {string} pollId - The ID of the poll.
 * @returns {Promise<object>} - A promise that resolves to the poll results.
 */
export async function getPollResults(pollId) {
  try {
    const response = await fetch(`/api/polls/${pollId}/results`);
    if (!response.ok) {
      throw new Error("Failed to fetch poll results");
    }
    return await response.json();
  } catch (error) {
    console.error("Error getting poll results:", error);
    throw new Error("Failed to get poll results: " + error.message);
  }
}