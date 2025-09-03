import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import EditPollForm from "@/components/polls/EditPollForm";

export default async function EditPollPage({ params, searchParams }) {
  try {
    // Await params in Next.js 15
    const { id } = await params;
    const pollParams = await searchParams;
    const userEmail = pollParams?.user;

    if (!userEmail) {
      notFound();
    }

    // Import the action dynamically to avoid SSR issues
    const { getPollForEditAction } = await import("@/lib/actions");
    const poll = await getPollForEditAction(id, userEmail);
    
    if (!poll) {
      notFound();
    }

    return (
      <div className="mx-auto max-w-4xl py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Edit Poll</h1>
          <p className="text-gray-600">
            Update your poll details and options
          </p>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <EditPollForm poll={poll} userEmail={userEmail} />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Link href={`/polls?user=${encodeURIComponent(userEmail)}`}>
            <Button variant="outline">Back to Polls</Button>
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching poll for edit:", error);
    notFound();
  }
}
