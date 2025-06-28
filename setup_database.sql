-- Create the borrowings table with the correct column structure
CREATE TABLE IF NOT EXISTS borrowings (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  book_name TEXT NOT NULL,
  gl_no TEXT NOT NULL UNIQUE,
  date_taken DATE NOT NULL,
  due_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE borrowings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated and anonymous users
-- This is for development - you may want to restrict this in production
CREATE POLICY "Allow all operations for all users" ON borrowings
  FOR ALL USING (true)
  WITH CHECK (true);

-- Insert some sample data (optional)
INSERT INTO borrowings (name, phone, book_name, gl_no, date_taken, due_date) VALUES
  ('John Doe', '1234567890', 'The Great Gatsby', 'GL001', '2024-01-15', '2024-01-29'),
  ('Jane Smith', '0987654321', 'To Kill a Mockingbird', 'GL002', '2024-01-16', '2024-01-30'),
  ('Bob Johnson', '5555555555', '1984', 'GL003', '2024-01-17', '2024-01-31')
ON CONFLICT (gl_no) DO NOTHING; 