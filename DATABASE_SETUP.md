# Database Setup Guide for Polling App

This guide will help you set up the Supabase database schema for the Polling App with QR Code Sharing functionality.

## Prerequisites

1. A Supabase project (create one at [supabase.com](https://supabase.com))
2. Your Supabase project URL and API keys

## Step 1: Set Up Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Replace the values with your actual Supabase project credentials.

## Step 2: Run the Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** section
3. Copy the entire contents of `supabase-schema.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute the schema

## Step 3: Verify the Setup

After running the schema, you should see the following tables created:

- `polls` - Stores poll information
- `poll_options` - Stores poll options/choices
- `votes` - Stores individual votes
- `poll_results` - A view for easy poll result queries

## Database Schema Overview

### Tables

#### `polls`
- **id**: Unique identifier (UUID)
- **title**: Poll title
- **description**: Optional poll description
- **question**: The main poll question
- **status**: Poll status ('active', 'closed', 'draft')
- **allow_multiple_votes**: Whether users can vote for multiple options
- **max_votes_per_option**: Maximum votes allowed per option
- **created_by**: User ID who created the poll
- **created_at**: Creation timestamp
- **updated_at**: Last update timestamp
- **expires_at**: Optional expiration date
- **is_public**: Whether the poll is publicly accessible
- **share_token**: Unique token for sharing polls

#### `poll_options`
- **id**: Unique identifier (UUID)
- **poll_id**: Reference to the poll
- **option_text**: The option text
- **option_order**: Display order of the option
- **created_at**: Creation timestamp

#### `votes`
- **id**: Unique identifier (UUID)
- **poll_id**: Reference to the poll
- **option_id**: Reference to the poll option
- **voter_id**: User ID (for authenticated users)
- **voter_email**: Email (for anonymous voting)
- **voter_name**: Name (for anonymous voting)
- **created_at**: Vote timestamp

### Security Features

The schema includes Row Level Security (RLS) policies that ensure:

1. **Public polls** are viewable by everyone
2. **Private polls** are only viewable by the creator
3. **Voting** is restricted to active, public polls
4. **Poll management** is restricted to the creator

### Helper Functions

#### `get_poll_with_results(poll_uuid)`
This function returns a complete poll with all options and vote counts in a single query, making it efficient to display poll results.

## Step 4: Test the Setup

You can test the database setup by running these sample queries in the SQL Editor:

```sql
-- Check if tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('polls', 'poll_options', 'votes');

-- Check if RLS policies are enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('polls', 'poll_options', 'votes');
```

## Step 5: Enable Authentication (Optional)

If you want to use Supabase Auth for user management:

1. Go to **Authentication** > **Settings** in your Supabase dashboard
2. Configure your authentication providers (Email, Google, etc.)
3. Set up your site URL and redirect URLs

## Troubleshooting

### Common Issues

1. **Permission Denied**: Make sure you're using the correct API keys
2. **RLS Policies**: If you can't access data, check that RLS policies are properly configured
3. **Foreign Key Errors**: Ensure all referenced tables exist before creating relationships

### Useful Queries

```sql
-- Check poll results
SELECT * FROM poll_results WHERE poll_id = 'your-poll-id';

-- Get a complete poll with results
SELECT * FROM get_poll_with_results('your-poll-id');

-- Check user's polls
SELECT * FROM polls WHERE created_by = 'user-id';
```

## Next Steps

After setting up the database:

1. Update your application code to use the new schema
2. Implement the poll creation functionality
3. Add voting mechanisms
4. Implement QR code generation for poll sharing
5. Test the complete flow

## Support

If you encounter any issues during setup, refer to the [Supabase documentation](https://supabase.com/docs) or check the project's GitHub issues.
