"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";


/**
 * Form component for creating a new poll.
 * Handles dynamic option fields, validation, and submission.
 * On success, redirects to poll list with user context.
 */
export function PollForm() {
  const [options, setOptions] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const userEmail = searchParams.get("user") || "";

  // Update a specific poll option
  function updateOption(index, value) {
    setOptions(prev => prev.map((opt, i) => (i === index ? value : opt)));
  }

  // Add a new option field
  function addOption() {
    setOptions(prev => [...prev, ""]);
  }

  // Remove an option field (minimum 2 required)
  function removeOption(index) {
    if (options.length > 2) {
      setOptions(prev => prev.filter((_, i) => i !== index));
    }
  }

  // Handle poll form submission
  async function handleSubmit(formData) {
    setIsSubmitting(true);
    setError("");
    try {
      // Add all non-empty options to formData
      options.forEach((option, index) => {
        if (option.trim()) {
          formData.append("options", option.trim());
        }
      });

      // Import the action dynamically to avoid SSR issues
      const { createPollAction } = await import("@/lib/actions");
      const result = await createPollAction(formData);
      if (result.success) {
        // Get the user email from the form
        const formUserEmail = formData.get("userEmail");
        // Redirect to polls page with success parameter and user email
        router.push(`/polls?success=true&user=${encodeURIComponent(formUserEmail)}`);
      }
    } catch (error) {
      // Show error message on failure
      console.error("Error creating poll:", error);
      setError("Failed to create poll: " + error.message);
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

      {/* User Information */}
      <div className="space-y-4">
        <Label className="text-lg font-medium">Your Information</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="userName">Your Name</Label>
            <Input 
              id="userName" 
              name="userName"
              placeholder="Enter your name" 
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userEmail">Your Email</Label>
            <Input 
              id="userEmail" 
              name="userEmail"
              type="email" 
              placeholder="your@email.com" 
              required
              defaultValue={userEmail}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Poll Title *</Label>
        <Input 
          id="title" 
          name="title"
          required
          placeholder="Enter a catchy title for your poll" 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="question">Question *</Label>
        <Input 
          id="question" 
          name="question"
          required
          placeholder="What's your question?" 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea 
          id="description" 
          name="description"
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
            defaultValue="1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiresAt">Expiration date (optional)</Label>
          <Input 
            id="expiresAt" 
            name="expiresAt"
            type="datetime-local"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            value="true"
            defaultChecked
            className="rounded"
          />
          <Label htmlFor="isPublic">Make poll public</Label>
        </div>
      </div>

      <div className="flex gap-4">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Creating poll..." : "Create poll"}
        </Button>
        <Link href="/" passHref>
          <Button as="a" variant="outline" className="w-full">
            Home
          </Button>
        </Link>
      </div>
    </form>
  );
}


