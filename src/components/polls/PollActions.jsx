"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PollActions({ poll, userEmail }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append("pollId", poll.id);
      formData.append("userEmail", userEmail);

      const { deletePollAction } = await import("@/lib/actions");
      await deletePollAction(formData);
      
      // Refresh the page to show updated poll list
      router.refresh();
    } catch (error) {
      console.error("Error deleting poll:", error);
      alert("Failed to delete poll: " + error.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Link href={`/polls/edit/${poll.id}?user=${encodeURIComponent(userEmail)}`}>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </Link>
      
      {showDeleteConfirm ? (
        <div className="flex gap-1">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Confirm"}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Delete
        </Button>
      )}
    </div>
  );
}
