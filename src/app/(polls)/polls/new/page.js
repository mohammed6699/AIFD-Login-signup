"use client";
import { PollForm } from "@/components/polls/PollForm";

export default function NewPollPage() {
  return (
    <div className="mx-auto max-w-2xl py-12 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Create a New Poll</h1>
        <p className="text-gray-600">Share your question and get instant feedback from your audience</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <PollForm />
      </div>
    </div>
  );
}


