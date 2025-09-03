import { Button } from "@/components/ui/button";
import Link from "next/link";
import SuccessMessage from "@/components/SuccessMessage";
import PollActions from "@/components/polls/PollActions";

export default async function PollsPage({ searchParams }) {
  // Await searchParams in Next.js 15
  const params = await searchParams;
  
  // Get user email from query parameter or use a default
  const userEmail = params?.user || "demo@example.com";
  const showSuccess = params?.success === "true";
  
  try {
    // Import the action dynamically to avoid SSR issues
    const { getUserPollsAction } = await import("@/lib/actions");
    const polls = await getUserPollsAction(userEmail);

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
          <Link href={`/polls/new?user=${encodeURIComponent(userEmail)}`}>
            <Button>Create New Poll</Button>
          </Link>
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
            <Link href={`/polls/new?user=${encodeURIComponent(userEmail)}`}>
              <Button size="lg">Create Your First Poll</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {polls.map((poll) => (
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
                    <Link href={`/polls/${poll.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/polls/share/${poll.share_token}`}>
                      <Button variant="outline" size="sm">
                        Share
                      </Button>
                    </Link>
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
  } catch (error) {
    console.error("Error fetching polls:", error);
    return (
      <div className="mx-auto max-w-4xl py-12 space-y-8">
        <div className="text-center py-12">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Error loading polls
          </h2>
          <p className="text-gray-600 mb-6">
            There was an error loading your polls. Please try again.
          </p>
          <Link href={`/polls/new?user=${encodeURIComponent(userEmail)}`}>
            <Button size="lg">Create Your First Poll</Button>
          </Link>
        </div>
      </div>
    );
  }
}


