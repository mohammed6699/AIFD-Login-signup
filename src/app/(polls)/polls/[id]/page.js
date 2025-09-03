import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";

export default async function PollDetailPage({ params }) {
  try {
    // Await params in Next.js 15
    const { id } = await params;
    
    // Import the action dynamically to avoid SSR issues
    const { getPollAction } = await import("@/lib/actions");
    const poll = await getPollAction(id);
    
    if (!poll) {
      notFound();
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/polls/share/${poll.share_token}`;

    return (
      <div className="mx-auto max-w-4xl py-12 space-y-8">
        {/* Poll Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">{poll.title}</h1>
          {poll.description && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {poll.description}
            </p>
          )}
          <p className="text-2xl font-semibold text-gray-800">
            {poll.question}
          </p>
        </div>

        {/* Poll Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {poll.total_votes}
              </div>
              <div className="text-gray-600">Total Votes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {poll.options?.length || 0}
              </div>
              <div className="text-gray-600">Options</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {poll.status}
              </div>
              <div className="text-gray-600">Status</div>
            </div>
          </div>
        </div>

        {/* Poll Results */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-semibold mb-6">Results</h2>
          <div className="space-y-4">
            {poll.options?.map((option) => (
              <div key={option.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{option.option_text}</span>
                  <span className="text-sm text-gray-600">
                    {option.vote_count} votes ({option.vote_percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${option.vote_percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-semibold mb-4">Share This Poll</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border rounded-md bg-gray-50"
              />
              <CopyButton text={shareUrl} />
            </div>
            <p className="text-sm text-gray-600">
              Share this link with others to let them vote on your poll!
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Link href="/polls">
            <Button variant="outline">Back to Polls</Button>
          </Link>
          <Link href="/polls/new">
            <Button>Create Another Poll</Button>
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching poll:", error);
    notFound();
  }
}


