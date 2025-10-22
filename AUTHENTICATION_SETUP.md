# InsightAI Authentication Setup Guide

This guide will help you set up user authentication for InsightAI using Supabase.

## 🚀 Features Added

- ✅ User registration with email, username, and password
- ✅ User login and authentication
- ✅ Profile management with custom profile pictures
- ✅ Ocean-Swirl.webp as default profile picture
- ✅ Welcome screen for new users with star design and gradient styling
- ✅ Sign out functionality
- ✅ Row Level Security (RLS) to protect user data

## 📋 Database Setup Instructions

### Step 1: Run User Profiles SQL Script

1. Open your Supabase project dashboard
2. Navigate to the **SQL Editor**
3. Copy and paste the contents of `database/user_profiles_table.sql`
4. Click **Run** to execute the script

This will:
- Create the `user_profiles` table
- Add `user_id` column to the `notes` table (if not exists)
- Set up Row Level Security (RLS) policies
- Configure automatic timestamp updates

### Step 2: Create Storage Bucket for Profile Pictures

1. In Supabase dashboard, go to **Storage**
2. Click **New bucket**
3. Name it: `profile-pictures`
4. Make it **Public** (so users can view profile pictures)
5. Click **Create bucket**

### Step 3: Set Up Storage Policies

Still in Storage, select the `profile-pictures` bucket and add these policies:

**Policy 1: Allow authenticated users to upload**
```sql
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Policy 2: Allow public read access**
```sql
CREATE POLICY "Public can view profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');
```

**Policy 3: Allow users to update their own pictures**
```sql
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Policy 4: Allow users to delete their own pictures**
```sql
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Step 4: Configure Supabase Auth Settings

1. Go to **Authentication** → **Settings**
2. Under **Email Auth**, make sure:
   - Enable email confirmations is **OFF** (for easier testing)
   - Or set it to **ON** and configure email templates
3. Under **Site URL**, add your local development URL:
   - `http://localhost:5173` (or your Vite dev server port)

### Step 5: Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎨 UI Components Created

### 1. **AuthContext** (`src/contexts/AuthContext.tsx`)
- Manages authentication state
- Provides `signUp`, `signIn`, `signOut` functions
- Automatically creates user profile on signup

### 2. **Login Component** (`src/components/auth/Login.tsx`)
- Email and password login
- Switch to signup option
- Error handling

### 3. **Signup Component** (`src/components/auth/Signup.tsx`)
- Email, username, and password registration
- Password validation (min 6 characters)
- Automatic profile creation with default picture

### 4. **Welcome Screen** (`src/components/auth/WelcomeScreen.tsx`)
- Beautiful animated welcome card
- Star background effect (similar to entry cards)
- Purple gradient button
- Feature highlights
- One-time display for new users

### 5. **AuthGate** (`src/components/auth/AuthGate.tsx`)
- Protects the app from unauthenticated access
- Routes users through login → welcome → app flow
- Loading states

### 6. **Profile Management** (in Settings)
- Upload/change profile picture
- Edit username
- View email
- Sign out button

## 🎯 User Flow

1. **New User**:
   - Sees Signup page
   - Creates account with email, username, password
   - Redirected to Welcome screen
   - Clicks "Let's Begin" → enters app

2. **Returning User**:
   - Sees Login page
   - Enters credentials
   - Directly enters app (skips welcome)

3. **Profile Management**:
   - Navigate to Settings
   - See profile section at the top
   - Click camera icon to upload new profile picture
   - Click edit icon to change username
   - Click "Sign Out" to log out

## 🔒 Security Features

- **Row Level Security (RLS)**: Users can only access their own notes and profile
- **Password Requirements**: Minimum 6 characters
- **Secure Storage**: Profile pictures stored in Supabase Storage with proper access policies
- **Auth State Management**: Automatic session handling with Supabase Auth

## 🎨 Design Highlights

The authentication UI matches your app's aesthetic:

- **Dark gradient backgrounds** (matching entry cards)
- **Star animations** on welcome screen
- **Purple gradient buttons** with shine effects
- **Glass morphism cards** with blur effects
- **Smooth animations** using Framer Motion
- **Ocean-Swirl.webp** as default profile picture

## 🧪 Testing

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. You should see the Login screen

3. Click "Sign up" to create a test account

4. Fill in:
   - Username: testuser
   - Email: test@example.com
   - Password: test123

5. After signup, you'll see the Welcome screen

6. Click "Let's Begin" to enter the app

7. Go to Settings to test profile management

## 📝 Notes

- The default profile picture (`Ocean-Swirl.webp`) must be in the `public/` folder
- All user notes are now scoped to the authenticated user
- Existing notes without `user_id` will need to be migrated (see migration section below)

## 🔄 Migrating Existing Notes

If you have existing notes in the database without a `user_id`, you'll need to assign them to a user:

```sql
-- Replace 'your-user-id' with actual user ID from auth.users
UPDATE notes 
SET user_id = 'your-user-id' 
WHERE user_id IS NULL;
```

## 🐛 Troubleshooting

**Issue**: Can't upload profile pictures
- **Solution**: Make sure the `profile-pictures` bucket exists and is public

**Issue**: Login/Signup not working
- **Solution**: Check your Supabase URL and Anon Key in `.env.local`

**Issue**: Users can see other users' notes
- **Solution**: Make sure RLS policies are enabled on the `notes` table

**Issue**: Email confirmation required
- **Solution**: In Supabase Auth settings, disable email confirmations for testing

## ✨ Next Steps

- Set up email templates for password recovery
- Add OAuth providers (Google, GitHub, etc.)
- Implement password reset functionality
- Add profile bio editing
- Create user settings preferences

---

**Enjoy your new authentication system! 🎉**
