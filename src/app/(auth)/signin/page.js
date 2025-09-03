"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData) {
    setIsSubmitting(true);
    setError("");

    try {
      // Import the action dynamically to avoid SSR issues
      const { signInAction } = await import("@/lib/actions");
      await signInAction(formData);
      router.replace("/polls");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-12 space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-neutral-500">Use your email to continue</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <form className="space-y-4" action={handleSubmit}>
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
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      
      <p className="text-sm text-neutral-600 text-center">
        No account? <Link className="underline" href="/signup">Sign up</Link>
      </p>
    </div>
  );
}


