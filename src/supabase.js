import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://eiposhexdebpdkfmdrxd.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpcG9zaGV4ZGVicGRrZm1kcnhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMTM0MDcsImV4cCI6MjA2NjY4OTQwN30.l6AXl3MJDyP8vqTopJcxqyejlBWbTWKuat8rSv1rypw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 