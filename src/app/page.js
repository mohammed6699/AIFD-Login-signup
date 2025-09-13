
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SuccessMessage from "@/components/SuccessMessage";
import PollActions from "@/components/polls/PollActions";

export default function PollsPage({ searchParams }) {
  // searchParams is a plain object in Next.js 13/14/15
  const params = searchParams || {};
  // Get user email from query parameter or use a default
  const userEmail = params.user || "demo@example.com";
  const showSuccess = params.success === "true";

  // SSR: require actions synchronously
  let polls = [];
  try {
    const { getUserPollsAction } = require("@/lib/actions");
    polls = getUserPollsAction(userEmail);
    if (polls instanceof Promise) {
      console.log("getUserPollsAction must be synchronous for SSR");
    }
  } catch (error) {
    console.error("Error fetching polls:", error);
    polls = [];
  }

  return (
    <div className="mx-auto max-w-4xl py-12 space-y-8">
      {/* Success Message */}
      {showSuccess && (
        <SuccessMessage 
          title="Poll Created Successfully!"
          message="Your poll has been created and is ready to share with others."
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Polls</h1>
          <p className="text-gray-600 mt-2">
            Manage and view your created polls
            {userEmail !== "demo@example.com" && (
              <span className="block text-sm text-blue-600">
                User: {userEmail}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href={`/polls/new?user=${encodeURIComponent(userEmail)}`}>Create New Poll</Link>
          </Button>
          <Button asChild variant="outline" className="contact-button">
            <Link href="/contact-page">Contact</Link>
          </Button>
        </div>
      </div>

      {/* Polls List */}
      {polls.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No polls yet
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first poll to start collecting feedback from your audience
          </p>
          <Button asChild size="lg">
            <Link href={`/polls/new?user=${encodeURIComponent(userEmail)}`}>Create Your First Poll</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {(Array.isArray(polls) ? polls : []).map((poll) => (
            <div
              key={poll.id}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {poll.title}
                  </h3>
                  <p className="text-gray-600 mb-2">{poll.question}</p>
                  {poll.description && (
                    <p className="text-gray-500 text-sm mb-3">
                      {poll.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      poll.status === 'active' ? 'bg-green-100 text-green-800' :
                      poll.status === 'closed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {poll.status}
                    </span>
                    <span>•</span>
                    <span>{poll.option_count || 0} options</span>
                    <span>•</span>
                    <span>{poll.total_votes || 0} votes</span>
                    <span>•</span>
                    <span>
                      Created {new Date(poll.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/polls/${poll.id}`}>View</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/polls/share/${poll.share_token}`}>Share</Link>
                  </Button>
                  <PollActions 
                    poll={poll} 
                    userEmail={userEmail}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}