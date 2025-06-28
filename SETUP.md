# Library App Setup Guide

## Prerequisites
1. Install Node.js from https://nodejs.org/
2. Create a Supabase project at https://supabase.com/

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Supabase**
   Create a `.env` file in the root directory with your Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_project_url_here
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **Set up Supabase Database**
   Create a table named `borrowings` with the following columns:
   - `id` (int8, primary key, auto-increment)
   - `name` (text, not null)
   - `phone` (text, not null)
   - `book_name` (text, not null)
   - `gl_no` (text, not null, unique)
   - `date_taken` (date, not null)
   - `due_date` (date, not null)
   - `created_at` (timestamp with time zone, default: now())

4. **Start the Application**
   ```bash
   npm start
   ```

## Getting Supabase Credentials
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "Project URL" and "anon public" key
4. Paste them in your `.env` file 