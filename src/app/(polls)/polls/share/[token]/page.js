import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import VoteForm from "@/components/polls/VoteForm";

export default async function SharedPollPage({ params }) {
  try {
    // Await params in Next.js 15
    const { token } = await params;
    
    // Import the action dynamically to avoid SSR issues
    const { getPollByShareTokenAction } = await import("@/lib/actions");
    const poll = await getPollByShareTokenAction(token);
    
    if (!poll) {
      notFound();
    }

    return (
      <div className="mx-auto max-w-2xl py-12 space-y-8">
        {/* Poll Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">{poll.title}</h1>
          {poll.description && (
            <p className="text-lg text-gray-600">
              {poll.description}
            </p>
          )}
          <p className="text-2xl font-semibold text-gray-800">
            {poll.question}
          </p>
        </div>

        {/* Voting Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <VoteForm poll={poll} />
        </div>

        {/* Poll Info */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            This poll was created by {poll.created_by}
          </p>
          {poll.expires_at && (
            <p className="text-sm text-gray-600 mt-1">
              Expires on {new Date(poll.expires_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching shared poll:", error);
    notFound();
  }
}
