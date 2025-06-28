# Troubleshooting Guide

## Error: "Could not find the 'bookName' column of 'borrowings' in the schema cache"

### ✅ FIXED: Column Mapping Issue
The error occurred because the app was trying to insert data with JavaScript property names (`bookName`, `glNo`) instead of database column names (`book_name`, `gl_no`).

**Solution Applied:**
- Updated `handleSubmit` function to map form data to correct database columns
- The app now correctly maps:
  - `bookName` → `book_name`
  - `glNo` → `gl_no`
  - `dateTaken` → `date_taken`
  - `dueDate` → `due_date`

### 🔧 Database Setup

If you're still having issues, run this SQL in your Supabase SQL Editor:

```sql
-- Drop existing table if it has wrong structure
DROP TABLE IF EXISTS borrowings;

-- Create the correct table structure
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

-- Enable RLS
ALTER TABLE borrowings ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for development)
CREATE POLICY "Allow all operations for all users" ON borrowings
  FOR ALL USING (true)
  WITH CHECK (true);
```

### 🧪 Test Your Connection

1. Go to http://localhost:3002
2. You should see the "Connection Test" page
3. The test will verify:
   - ✅ Database connection
   - ✅ Table exists with correct structure
   - ✅ Can insert/delete data

### 📋 Expected Column Structure

Your `borrowings` table should have these columns:
- `id` (BIGSERIAL, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `phone` (TEXT, NOT NULL)
- `book_name` (TEXT, NOT NULL)
- `gl_no` (TEXT, NOT NULL, UNIQUE)
- `date_taken` (DATE, NOT NULL)
- `due_date` (DATE, NOT NULL)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### 🔍 Check Your Table Structure

In Supabase Dashboard:
1. Go to Table Editor
2. Click on `borrowings` table
3. Verify column names match exactly (use underscores, not camelCase)

### 🚀 Next Steps

Once the connection test passes:
1. Click "🏠 Go to Main App"
2. Try adding a new book borrowing
3. The form should now work correctly 