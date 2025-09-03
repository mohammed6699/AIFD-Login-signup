"use client";
import { Protected } from "@/context/AuthContext";

export default function PollsLayout({ children }) {
  return <Protected>{children}</Protected>;
}


