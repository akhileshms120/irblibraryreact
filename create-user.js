const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://eiposhexdebpdkfmdrxd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpcG9zaGV4ZGVicGRrZm1kcnhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTExMzQwNywiZXhwIjoyMDY2Njg5NDA3fQ.VorXFLUuQQF05rQB60SsyHhlI9ltNi7rA77X61aLz8g'; // Get this from Supabase Dashboard > Settings > API

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUser(email, password, role = 'user') {
  try {
    console.log(`Creating user: ${email} with role: ${role}`);
    
    // Create the user using signUp
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      console.error('❌ Error creating user:', error.message);
      return false;
    }

    if (data && data.user) {
      // Assign role in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          user_id: data.user.id, 
          role: role,
          email: email,
          created_at: new Date().toISOString()
        }]);

      if (profileError) {
        console.error('⚠️  User created but error assigning role:', profileError.message);
        console.log('   You may need to create the profiles table first');
        return false;
      } else {
        console.log('✅ User created and assigned role successfully:', data.user.email);
        console.log('   User ID:', data.user.id);
        console.log('   Role:', role);
        return true;
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function createUserWithAdmin(email, password) {
  return await createUser(email, password, 'admin');
}

async function listUsers() {
  try {
    console.log('Fetching users...');
    
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('❌ Error fetching users:', error.message);
      return;
    }

    console.log('📋 Current users:');
    data.users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.confirmed_at ? 'Confirmed' : 'Pending'})`);
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

async function listProfiles() {
  try {
    console.log('Fetching user profiles...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching profiles:', error.message);
      console.log('   You may need to create the profiles table first');
      return;
    }

    console.log('📋 User profiles:');
    if (data.length === 0) {
      console.log('   No profiles found');
    } else {
      data.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.email} - Role: ${profile.role}`);
      });
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

async function createProfilesTable() {
  try {
    console.log('Creating profiles table...');
    
    // This is a simplified version - you should create this table in Supabase Dashboard
    console.log('📖 To create the profiles table:');
    console.log('   1. Go to Supabase Dashboard → Table Editor');
    console.log('   2. Click "New Table"');
    console.log('   3. Name it "profiles"');
    console.log('   4. Add columns:');
    console.log('      - user_id (uuid, primary key)');
    console.log('      - role (text)');
    console.log('      - email (text)');
    console.log('      - created_at (timestamp)');
    console.log('   5. Set up Row Level Security (RLS) policies');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!supabaseServiceKey || supabaseServiceKey === 'YOUR_SERVICE_ROLE_KEY') {
    console.error('❌ Please set your SUPABASE_SERVICE_KEY environment variable or update the script');
    console.log('📖 To get your service key:');
    console.log('   1. Go to Supabase Dashboard');
    console.log('   2. Navigate to Settings > API');
    console.log('   3. Copy the "service_role" key');
    console.log('   4. Set it as SUPABASE_SERVICE_KEY environment variable');
    return;
  }

  switch (command) {
    case 'create':
      const email = args[1];
      const password = args[2];
      const role = args[3] || 'user';
      
      if (!email || !password) {
        console.log('📖 Usage: node create-user.js create <email> <password> [role]');
        console.log('📖 Example: node create-user.js create admin@library.com admin123 admin');
        console.log('📖 Available roles: admin, librarian, user');
        return;
      }
      
      await createUser(email, password, role);
      break;
      
    case 'create-admin':
      const adminEmail = args[1];
      const adminPassword = args[2];
      
      if (!adminEmail || !adminPassword) {
        console.log('📖 Usage: node create-user.js create-admin <email> <password>');
        console.log('📖 Example: node create-user.js create-admin admin@library.com admin123');
        return;
      }
      
      await createUserWithAdmin(adminEmail, adminPassword);
      break;
      
    case 'list':
      await listUsers();
      break;
      
    case 'profiles':
      await listProfiles();
      break;
      
    case 'setup-table':
      await createProfilesTable();
      break;
      
    case 'demo':
      console.log('🚀 Creating demo users...');
      await createUser('admin@library.com', 'admin123', 'admin');
      await createUser('librarian@library.com', 'librarian123', 'librarian');
      await createUser('user@library.com', 'user123', 'user');
      console.log('📋 Listing all users...');
      await listUsers();
      console.log('📋 Listing all profiles...');
      await listProfiles();
      break;
      
    default:
      console.log('📖 Available commands:');
      console.log('   node create-user.js create <email> <password> [role]     - Create a new user with role');
      console.log('   node create-user.js create-admin <email> <password>      - Create a new admin user');
      console.log('   node create-user.js list                                 - List all users');
      console.log('   node create-user.js profiles                             - List all user profiles');
      console.log('   node create-user.js setup-table                          - Show how to create profiles table');
      console.log('   node create-user.js demo                                 - Create demo users');
      console.log('');
      console.log('📖 Examples:');
      console.log('   node create-user.js create admin@library.com admin123 admin');
      console.log('   node create-user.js create librarian@library.com lib123 librarian');
      console.log('   node create-user.js create user@library.com user123');
      console.log('   node create-user.js list');
      console.log('   node create-user.js profiles');
      console.log('   node create-user.js demo');
  }
}

main().catch(console.error); 