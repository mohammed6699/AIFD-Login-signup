# Local Database Setup for Polling App

This project now uses a local SQLite database instead of Supabase, making it easy to run without external dependencies.

## 🗄️ Database Features

- **SQLite Database**: Stored locally as `polls.db` in your project root
- **No External Dependencies**: No need for Supabase or other cloud services
- **Automatic Setup**: Database and tables are created automatically on first run
- **Simple Authentication**: Email-based user management without passwords

## 🚀 Getting Started

1. **Install Dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start the Development Server**:
   ```bash
   npm run dev
   ```

3. **Database Setup**: The database will be automatically created when you first access the app.

## 📊 Database Schema

The local database includes the following tables:

- **`polls`**: Stores poll information (title, question, settings, etc.)
- **`poll_options`**: Stores poll choices/options
- **`votes`**: Stores individual votes
- **`users`**: Stores user information (email-based)

## 🔧 How It Works

### Creating Polls
1. Navigate to `/polls/new`
2. Fill in your information (name and email)
3. Create your poll with options
4. The poll is saved to the local database

### Voting
1. Share the poll link with others
2. Voters can submit votes anonymously or with their information
3. Results are calculated in real-time

### Viewing Results
- Poll creators can view detailed results
- Vote counts and percentages are displayed
- Share links work for public polls

## 📁 Database File

The database is stored as `polls.db` in your project root. This file contains all your polls, votes, and user data.

## 🔒 Security Notes

- This is a local development setup
- No password authentication (email-based only)
- Data is stored locally on your machine
- For production, consider using a proper database with authentication

## 🛠️ Troubleshooting

### Database Issues
- If you encounter database errors, delete the `polls.db` file and restart the server
- The database will be recreated automatically

### File Permissions
- Ensure the app has write permissions in the project directory
- The database file needs to be created and modified

## 📈 Next Steps

To enhance this setup, you could:

1. Add proper password authentication
2. Implement user sessions
3. Add data export/import functionality
4. Set up database backups
5. Add admin features for poll management

## 🎯 Usage Examples

### Create a Poll
1. Go to `/polls/new`
2. Enter your name and email
3. Add poll title and question
4. Add poll options
5. Configure settings (multiple votes, expiration, etc.)
6. Submit to create the poll

### Vote on a Poll
1. Use the share link provided by the poll creator
2. Select your preferred option(s)
3. Optionally provide your name and email
4. Submit your vote

### View Results
1. Go to `/polls` to see your created polls
2. Click "View" to see detailed results
3. Use "Share" to get the voting link

The local database setup makes this app completely self-contained and easy to run for development and testing purposes!
