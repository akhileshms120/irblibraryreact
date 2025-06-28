# Quick Setup Guide

## Current Status
✅ Dependencies installed  
✅ App compiled successfully  
⚠️ Supabase not configured (showing white screen)

## To Fix the White Screen:

### Option 1: Quick Test (No Database)
The app should now work with a mock database. Refresh your browser at http://localhost:3002

### Option 2: Set Up Supabase (Recommended)

1. **Create a Supabase account** at https://supabase.com/
2. **Create a new project**
3. **Get your credentials:**
   - Go to Settings → API
   - Copy "Project URL" and "anon public" key

4. **Create a `.env` file** in your project root:
   ```
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. **Create the database table:**
   - Go to SQL Editor in Supabase
   - Run this SQL:
   ```sql
   CREATE TABLE borrowings (
     id BIGSERIAL PRIMARY KEY,
     name TEXT NOT NULL,
     phone TEXT NOT NULL,
     book_name TEXT NOT NULL,
     gl_no TEXT NOT NULL UNIQUE,
     date_taken DATE NOT NULL,
     due_date DATE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

6. **Restart the app:**
   ```bash
   npm start
   ```

## If you still see a white screen:
1. Open browser developer tools (F12)
2. Check the Console tab for errors
3. Check the Network tab for failed requests 