import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://eiposhexdebpdkfmdrxd.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpcG9zaGV4ZGVicGRrZm1kcnhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMTM0MDcsImV4cCI6MjA2NjY4OTQwN30.l6AXl3MJDyP8vqTopJcxqyejlBWbTWKuat8rSv1rypw'

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'

if (!hasValidCredentials) {
  console.warn('⚠️ Supabase credentials not configured. Please set up your .env file with REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY')
}

// Create a mock client for development when credentials are missing
const mockSupabase = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    update: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    delete: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    eq: () => Promise.resolve({ data: null, error: null }),
    single: () => Promise.resolve({ data: null, error: null }),
    order: () => Promise.resolve({ data: [], error: null }),
    limit: () => Promise.resolve({ data: [], error: null })
  })
}

export const supabase = hasValidCredentials ? createClient(supabaseUrl, supabaseAnonKey) : mockSupabase 