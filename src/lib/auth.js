"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);


/**
 * Sign in a user using email and password.
 * Throws an error if credentials are missing or invalid.
 * @param {FormData} formData - Contains 'email' and 'password'.
 * @returns {Object} Supabase user/session data.
 */
export async function signIn(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // Validate credentials
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Attempt sign-in via Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Bubble up Supabase error
    throw new Error(error.message);
  }

  return data;
}


/**
 * Register a new user with email, password, and optional name.
 * Name defaults to email prefix if not provided.
 * @param {FormData} formData - Contains 'email', 'password', and optional 'name'.
 * @returns {Object} Supabase user/session data.
 */
export async function signUp(formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");

  // Validate credentials
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Attempt sign-up via Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || email.split("@")[0],
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}



/**
 * Sign out the current user from Supabase session.
 * Throws error if sign-out fails.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}


/**
 * Retrieve the currently authenticated user from Supabase.
 * Returns null if not authenticated or error occurs.
 * @returns {Object|null} Supabase user object or null.
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return user;
}


/**
 * Create a demo user for testing purposes.
 * Useful for local development when full auth is not set up.
 * @returns {Object} Demo user credentials and Supabase user object.
 */
export async function createDemoUser() {
  const demoEmail = `demo-${Date.now()}@example.com`;
  const demoPassword = "demo123456";

  // Register demo user
  const { data, error } = await supabase.auth.signUp({
    email: demoEmail,
    password: demoPassword,
    options: {
      data: {
        name: "Demo User",
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return { email: demoEmail, password: demoPassword, user: data.user };
}
