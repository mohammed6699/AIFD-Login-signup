"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


/**
 * Form component for submitting votes to a poll.
 * Handles single/multiple selection, optional voter info, and submission.
 * Shows confirmation after successful vote.
 */
export default function VoteForm({ poll }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [voterEmail, setVoterEmail] = useState("");
  const [voterName, setVoterName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Toggle option selection (supports multiple votes if allowed)
  const handleOptionToggle = (optionId) => {
    if (poll.allow_multiple_votes) {
      setSelectedOptions(prev => 
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  // Handle vote form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedOptions.length === 0) {
      alert("Please select at least one option");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("pollId", poll.id);
      selectedOptions.forEach(optionId => {
        formData.append("optionIds", optionId);
      });
      // Attach optional voter info
      if (voterEmail) {
        formData.append("voterEmail", voterEmail);
      }
      if (voterName) {
        formData.append("voterName", voterName);
      }
      // Import the action dynamically to avoid SSR issues
      const { submitVoteAction } = await import("@/lib/actions");
      await submitVoteAction(formData);
      setHasVoted(true);
    } catch (error) {
      // Show error message on failure
      console.error("Error submitting vote:", error);
      alert("Failed to submit vote: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasVoted) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-600 text-6xl">✅</div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Vote Submitted!
        </h2>
        <p className="text-gray-600">
          Thank you for voting. Your response has been recorded.
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
        >
          View Results
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Label className="text-lg font-medium">Select your answer:</Label>
        <div className="space-y-3">
          {poll.poll_options?.map((option) => (
            <div key={option.id} className="flex items-center space-x-3">
              <input
                type={poll.allow_multiple_votes ? "checkbox" : "radio"}
                id={option.id}
                name="options"
                value={option.id}
                checked={selectedOptions.includes(option.id)}
                onChange={() => handleOptionToggle(option.id)}
                className="rounded"
              />
              <Label 
                htmlFor={option.id} 
                className="flex-1 cursor-pointer text-base"
              >
                {option.option_text}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Optional voter information */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium text-gray-900">Your Information (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="voterName">Name</Label>
            <Input
              id="voterName"
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="voterEmail">Email</Label>
            <Input
              id="voterEmail"
              type="email"
              value={voterEmail}
              onChange={(e) => setVoterEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting || selectedOptions.length === 0}
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : "Submit Vote"}
      </Button>
    </form>
  );
}
