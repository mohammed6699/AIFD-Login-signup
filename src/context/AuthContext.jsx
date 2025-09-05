"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";


// Context for authentication state (user, session, loading)
const AuthContext = createContext({ user: null, session: null, loading: true });

/**
 * Provider component to manage Supabase authentication state.
 * Listens for auth changes and updates context values.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    // Initialize session and user from Supabase
    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!ignore) {
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    }
    init();
    // Listen for auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    return () => {
      ignore = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access authentication context.
 */
export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Protects routes/components from unauthenticated access.
 * Redirects to signin if not authenticated.
 */
export function Protected({ children, redirectTo = "/signin" }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user && typeof window !== "undefined") {
    window.location.href = redirectTo;
    return null;
  }
  return children;
}


