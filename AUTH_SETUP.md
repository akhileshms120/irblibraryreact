# Authentication Setup Guide

This guide explains how to set up user authentication for the library management system.

## Prerequisites

- Access to your Supabase project dashboard
- The Supabase project URL and anon key (already configured in `src/supabase.js`)

## Setting Up Users in Supabase

### Method 1: Using Supabase Dashboard (Recommended)

1. **Access Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Sign in to your account
   - Select your project

2. **Navigate to Authentication**
   - In the left sidebar, click on "Authentication"
   - Click on "Users" tab

3. **Add New User**
   - Click "Add user" button
   - Enter the user's email address
   - Enter a secure password (minimum 6 characters)
   - Click "Create user"

4. **User Confirmation**
   - The user will receive a confirmation email
   - They need to click the confirmation link to activate their account
   - Alternatively, you can manually confirm the user in the dashboard

### Method 2: Using Supabase CLI (Alternative Installation)

**Note**: Supabase CLI cannot be installed globally via npm. Use one of these methods:

#### Option A: Using Windows Package Manager (winget)
```bash
winget install Supabase.CLI
```

#### Option B: Using Chocolatey
```bash
choco install supabase
```

#### Option C: Manual Installation
1. Go to [Supabase CLI releases](https://github.com/supabase/cli/releases)
2. Download the Windows executable
3. Add it to your PATH

#### Option D: Using npx (No Installation Required)
```bash
npx supabase auth admin create-user --email user@example.com --password securepassword
```

### Method 3: Using Supabase Dashboard API (Recommended for Development)

You can create a simple admin script to add users. Create a file called `create-user.js` in your project root:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eiposhexdebpdkfmdrxd.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // Get this from Supabase Dashboard > Settings > API

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUser(email, password) {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
     // email_confirm: null
    });

    if (error) {
      console.error('Error creating user:', error);
    } else {
      console.log('User created successfully:', data.user.email);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Example usage
createUser('admin@library.com', 'admin123');
```

To use this script:
1. Get your service role key from Supabase Dashboard → Settings → API
2. Replace `YOUR_SERVICE_ROLE_KEY` with your actual service role key
3. Run: `node create-user.js`

### Method 4: Direct Database Insert (Advanced)

If you have database access, you can directly insert users into the auth.users table, but this is not recommended for production.

## User Management

### Viewing Users
- Go to Supabase Dashboard → Authentication → Users
- You can see all registered users, their status, and last sign-in

### Editing Users
- Click on any user in the list
- You can modify their email, password, or other details
- You can also enable/disable users

### Deleting Users
- Select a user and click "Delete"
- This action cannot be undone

## Security Best Practices

1. **Strong Passwords**: Ensure users create strong passwords
2. **Email Verification**: Always require email verification for new accounts
3. **Session Management**: Users can sign out using the "Sign Out" button
4. **Access Control**: Only authorized users should have access to the library system
5. **Service Role Key**: Keep your service role key secure and never expose it in client-side code

## Troubleshooting

### User Cannot Sign In
- Check if the user account is confirmed
- Verify the email and password are correct
- Ensure the user account is not disabled

### Email Not Received
- Check spam/junk folder
- Verify email address is correct
- Resend confirmation email from Supabase dashboard

### Connection Issues
- Verify Supabase URL and anon key in `src/supabase.js`
- Check internet connection
- Ensure Supabase service is running

### CLI Installation Issues
- Use the dashboard method instead of CLI
- Try the npx method: `npx supabase --help`
- Check if you have the latest Node.js version

## Default Test User

For testing purposes, you can create a test user:
- Email: `admin@library.com`
- Password: `admin123`

**Note**: Change this password immediately in production!

## Quick Start (Recommended)

1. **Go to Supabase Dashboard** → Authentication → Users
2. **Click "Add user"**
3. **Enter email and password**
4. **Click "Create user"**
5. **Confirm the user** (if email confirmation is required)
6. **Test the sign-in** in your React app

## Next Steps

Once users are set up:
1. Users can sign in using their email and password
2. The system will automatically redirect to the library management interface
3. Users can sign out using the "Sign Out" button in the header
4. Session persistence is handled automatically by Supabase 