// Database schema types for the Polling App

export type PollStatus = 'active' | 'closed' | 'draft';

export interface Poll {
  id: string;
  title: string;
  description?: string;
  question: string;
  status: PollStatus;
  allow_multiple_votes: boolean;
  max_votes_per_option: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  is_public: boolean;
  share_token: string;
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  option_order: number;
  created_at: string;
}

export interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  voter_id?: string;
  voter_email?: string;
  voter_name?: string;
  created_at: string;
}

export interface PollOptionWithVotes extends PollOption {
  vote_count: number;
  vote_percentage: number;
}

export interface PollWithResults extends Poll {
  total_votes: number;
  options: PollOptionWithVotes[];
}

export interface PollResults {
  poll_id: string;
  poll_title: string;
  poll_question: string;
  option_id: string;
  option_text: string;
  option_order: number;
  vote_count: number;
  vote_percentage: number;
}

// Form types for creating polls
export interface CreatePollFormData {
  title: string;
  description?: string;
  question: string;
  options: string[];
  allow_multiple_votes: boolean;
  max_votes_per_option: number;
  expires_at?: string;
  is_public: boolean;
}

// Form types for voting
export interface VoteFormData {
  poll_id: string;
  option_ids: string[];
  voter_email?: string;
  voter_name?: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// QR Code data structure
export interface QRCodeData {
  poll_id: string;
  share_token: string;
  url: string;
}
