# ALX Polly

ALX Polly is a modern polling and voting web application built with Next.js, Supabase, and SQLite. It allows users to sign up, create polls, vote, and view results in real time.

## Tech Stack
- **Next.js** (React framework)
- **Supabase** (authentication & cloud database)
- **SQLite** (local development database)
- **Better-SQLite3** (Node.js SQLite driver)
- **Tailwind CSS** (UI styling)

## Project Structure
- `src/lib/` — Core logic (auth, actions, database)
- `src/components/` — UI components (polls, forms, dashboard)
- `src/context/` — React context for authentication
- `src/app/` — Next.js app directory (routes, pages)

## Setup Instructions
1. **Clone the repository**
	```bash
	git clone <repo-url>
	cd AIFD-Login-signup
	```
2. **Install dependencies**
	```bash
	npm install
	```
3. **Configure Supabase**
	- Create a project at [Supabase](https://supabase.com/)
	- Get your `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from Supabase dashboard
	- Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
	  ```env
	  NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
	  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
	  ```
4. **Local Database**
	- SQLite database (`polls.db`) is auto-created in the project root
	- Schema is initialized automatically on first run

## Usage Examples
### Creating a Poll
1. Sign in or sign up
2. Go to "Create Poll"
3. Fill in poll title, question, options, and settings
4. Submit to create and share your poll

### Voting on a Poll
1. Open a poll link
2. Select one or more options (if allowed)
3. Optionally enter your name/email
4. Submit your vote and view results

## Running Locally
Start the development server:
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Testing
- Unit and integration tests are in `src/app/__tests__/` and `src/api/__tests__/`
- Run tests with:
  ```bash
  npm test
  ```

## Troubleshooting
- See `TROUBLESHOOTING.md` and `LOCAL_DATABASE_README.md` for common issues.

## Deployment
- Deploy easily on [Vercel](https://vercel.com/) or your preferred platform.

---
For more details, see the code comments and docstrings throughout the codebase.
