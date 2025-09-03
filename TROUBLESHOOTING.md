# Troubleshooting Guide for Polling App

This guide helps you resolve common issues when running the polling app with the local SQLite database.

## 🚨 Common Errors and Solutions

### 1. Database Connection Errors

**Error**: `Cannot find module 'better-sqlite3'`
**Solution**: 
```bash
npm install better-sqlite3 @types/better-sqlite3
```

**Error**: `Database is locked` or `SQLITE_BUSY`
**Solution**: 
- Close any other applications that might be accessing the database
- Delete the `polls.db` file and restart the server
- The database will be recreated automatically

### 2. Module Import Errors

**Error**: `SyntaxError: Cannot use import statement outside a module`
**Solution**: 
- Ensure all files use ES modules syntax (import/export)
- Check that `package.json` has `"type": "module"` or use `.mjs` extensions

**Error**: `ERR_MODULE_NOT_FOUND`
**Solution**:
- Make sure all import paths are correct
- Use relative paths for local imports
- Check file extensions

### 3. Server Actions Errors

**Error**: `Server Actions must be async functions`
**Solution**:
- Ensure all Server Actions are marked with `async`
- Use proper error handling with try/catch

**Error**: `FormData is not defined`
**Solution**:
- Make sure you're using the latest version of Next.js
- Server Actions automatically receive FormData

### 4. Database Schema Errors

**Error**: `no such table: polls`
**Solution**:
- The database should be initialized automatically
- Check that `src/lib/database.js` is being imported
- Look for "Database initialized successfully" in console

### 5. File Permission Errors

**Error**: `EACCES: permission denied`
**Solution**:
- Ensure the app has write permissions in the project directory
- Run the terminal as administrator if needed
- Check that `polls.db` can be created in the project root

## 🔧 Testing the Setup

### 1. Test Database Connection
Visit: `http://localhost:3000/api/test-db`

Expected response:
```json
{
  "success": true,
  "message": "Database connection successful",
  "test": { "test": 1 }
}
```

### 2. Test Poll Creation
1. Go to `http://localhost:3000/polls/new`
2. Fill in the form with test data
3. Submit the form
4. You should be redirected to the poll results page

### 3. Test Voting
1. Use the share link from a created poll
2. Submit a vote
3. Check that the vote is recorded

## 🛠️ Manual Database Reset

If you need to reset the database:

1. Stop the development server
2. Delete the `polls.db` file from your project root
3. Restart the server: `npm run dev`
4. The database will be recreated automatically

## 📋 Environment Checklist

- [ ] Node.js version 18+ installed
- [ ] All dependencies installed: `npm install`
- [ ] Database file can be created in project root
- [ ] No other processes using the database
- [ ] Proper file permissions

## 🔍 Debug Mode

To enable debug logging, add this to your `.env.local`:
```
DEBUG=true
```

This will show additional console logs for database operations.

## 📞 Getting Help

If you're still experiencing issues:

1. Check the browser console for JavaScript errors
2. Check the terminal for server-side errors
3. Verify the database file exists: `ls polls.db`
4. Test the database connection: `http://localhost:3000/api/test-db`

## 🎯 Quick Fix Commands

```bash
# Reset everything
rm -rf node_modules package-lock.json polls.db
npm install
npm run dev

# Check database
ls -la polls.db

# Test database connection
curl http://localhost:3000/api/test-db
```

## 📝 Common Issues by Platform

### Windows
- File permission issues with SQLite
- Path separator issues
- Antivirus blocking database creation

### macOS
- File permission issues
- Gatekeeper blocking native modules

### Linux
- Missing system dependencies
- Permission issues with project directory

## 🔄 Alternative Setup

If you continue to have issues with SQLite, you can:

1. Use a different database (PostgreSQL, MySQL)
2. Use a cloud database service
3. Use in-memory storage for development

The app is designed to be database-agnostic, so switching databases should be straightforward.
