"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData) {
    setIsSubmitting(true);
    setError("");

    try {
      // Import the action dynamically to avoid SSR issues
      const { signUpAction } = await import("@/lib/actions");
      await signUpAction(formData);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-12 space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="text-sm text-neutral-500">Start creating and voting on polls</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <form className="space-y-4" action={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            name="name"
            placeholder="Jane Doe" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="you@example.com" 
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password (optional)</Label>
          <Input 
            id="password" 
            name="password"
            type="password" 
            placeholder="••••••••" 
          />
        </div>
        <Button 
          className="w-full" 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
      
      <p className="text-sm text-neutral-600 text-center">
        Already have an account? <Link className="underline" href="/signin">Sign in</Link>
      </p>
    </div>
  );
}


