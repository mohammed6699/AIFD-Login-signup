"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function EditPollForm({ poll, userEmail }) {
  const [options, setOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Initialize options from poll data
  useEffect(() => {
    if (poll.options) {
      setOptions(poll.options.map(opt => opt.option_text));
    }
  }, [poll]);

  function updateOption(index, value) {
    setOptions(prev => prev.map((opt, i) => (i === index ? value : opt)));
  }

  function addOption() {
    setOptions(prev => [...prev, ""]);
  }

  function removeOption(index) {
    if (options.length > 2) {
      setOptions(prev => prev.filter((_, i) => i !== index));
    }
  }

  async function handleSubmit(formData) {
    setIsSubmitting(true);
    setError("");
    
    try {
      // Add poll ID and user email
      formData.append("pollId", poll.id);
      formData.append("userEmail", userEmail);

      // Add all options to formData
      options.forEach((option, index) => {
        if (option.trim()) {
          formData.append("options", option.trim());
        }
      });

      // Import the action dynamically to avoid SSR issues
      const { updatePollAction } = await import("@/lib/actions");
      const result = await updatePollAction(formData);
      
      if (result.success) {
        // Redirect to polls page with success parameter
        router.push(`/polls?success=true&user=${encodeURIComponent(userEmail)}`);
      }
    } catch (error) {
      console.error("Error updating poll:", error);
      setError("Failed to update poll: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Poll Title *</Label>
        <Input 
          id="title" 
          name="title"
          required
          defaultValue={poll.title}
          placeholder="Enter a catchy title for your poll" 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="question">Question *</Label>
        <Input 
          id="question" 
          name="question"
          required
          defaultValue={poll.question}
          placeholder="What's your question?" 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea 
          id="description" 
          name="description"
          defaultValue={poll.description || ""}
          placeholder="Add more context or details about your poll" 
        />
      </div>

      <div className="space-y-4">
        <Label>Poll Options *</Label>
        <div className="space-y-3">
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <Input 
                value={opt} 
                onChange={e => updateOption(i, e.target.value)} 
                placeholder={`Option ${i + 1}`}
                required={i < 2}
              />
              {options.length > 2 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeOption(i)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button 
          type="button" 
          variant="outline" 
          onClick={addOption}
          disabled={options.length >= 10}
        >
          Add option
        </Button>
      </div>

      <div className="space-y-4">
        <Label>Poll Settings</Label>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="allowMultipleVotes"
            name="allowMultipleVotes"
            value="true"
            defaultChecked={poll.allow_multiple_votes === 1}
            className="rounded"
          />
          <Label htmlFor="allowMultipleVotes">Allow multiple votes per person</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxVotesPerOption">Maximum votes per option</Label>
          <Input 
            id="maxVotesPerOption" 
            name="maxVotesPerOption"
            type="number"
            min="1"
            max="10"
            defaultValue={poll.max_votes_per_option || 1}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiresAt">Expiration date (optional)</Label>
          <Input 
            id="expiresAt" 
            name="expiresAt"
            type="datetime-local"
            defaultValue={poll.expires_at ? new Date(poll.expires_at).toISOString().slice(0, 16) : ""}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            value="true"
            defaultChecked={poll.is_public === 1}
            className="rounded"
          />
          <Label htmlFor="isPublic">Make poll public</Label>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Updating poll..." : "Update poll"}
      </Button>
    </form>
  );
}
