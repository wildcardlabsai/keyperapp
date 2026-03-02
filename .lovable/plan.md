

# Admin Account, Support System, and Knowledge Base

## 1. Create Admin Account

I cannot create a user account directly through the database -- the user needs to sign up via the app first. Here's the approach:

- **You sign up** at `/signup` with email `mattoftaylor@gmail.com` and password `123456` (Supabase minimum is 6 characters, so this works)
- Once signed up, I will **insert the admin role** into the `user_roles` table for your user ID
- Alternatively, I can create an **edge function** that creates the account using the service role key and assigns the admin role in one step -- this is the cleaner approach and I will use it

## 2. Admin Panel: Password Change for Users

Add a "Reset password" action button per user in the Admin panel's user list. Since Supabase doesn't allow admins to set passwords directly from the client, this will:
- Use an edge function with the service role key to call `admin.updateUserById()` to set a new password
- Admin clicks "Reset password" on a user row, enters a new password in a dialog, and confirms

## 3. Support Ticket System

### Database
- New `support_tickets` table: `id`, `user_id` (nullable for guest submissions), `name`, `email`, `subject`, `message`, `status` (open/in_progress/resolved), `priority`, `created_at`, `updated_at`, `admin_response`
- RLS: users can read/insert their own tickets; admins can read/update all

### Contact/Support Page (`/contact`)
- Redesign with two sections: **Contact Form** (for anyone) and **Knowledge Base** below
- Form submissions save to `support_tickets` table AND send an email notification to `WildcardAILabs@gmail.com` via an edge function (will need an email service -- I'll store them in the DB and we can discuss email forwarding separately)
- For now, tickets are stored in the database and viewable by admins

### Dashboard Support Tab
- Add a "Support" tab to the dashboard sidebar
- Shows the logged-in user's tickets with status badges
- "New Ticket" button to create a ticket from the dashboard
- View ticket details and any admin responses

### Admin Panel: Support Tab
- Add a "Support" tab to the admin sidebar
- View all tickets, filter by status
- Click a ticket to view details and write a response
- Change ticket status (open / in progress / resolved)

## 4. Knowledge Base

Populate the Support/Contact page with a searchable knowledge base section containing articles relevant to Keyper. Categories and articles:

**Getting Started**
- How to create your vault
- Adding your first API key
- Understanding your vault passphrase

**Security**
- How Keyper encrypts your data
- What is zero-knowledge encryption?
- Two-factor authentication setup

**Managing Keys**
- Organizing keys with tags and environments
- Importing and exporting your vault
- Understanding key limits (Free vs Pro)

**Account & Billing**
- Upgrading to Pro
- Changing your password
- Deleting your account

**Troubleshooting**
- I forgot my vault passphrase
- My key won't decrypt
- Login issues and account recovery

Each article will have a title, category, and body content -- all hardcoded (no DB needed). The knowledge base will be searchable.

## 5. Navbar Update

- Rename the "Support" link to point to `/support` (knowledge base + contact form page)
- Keep `/contact` redirecting or merge into `/support`

## Technical Summary

### New Database Tables
- `support_tickets` with RLS policies

### New Files
- `src/pages/Support.tsx` -- Knowledge base + contact form
- `src/components/dashboard/SupportTab.tsx` -- User's ticket list in dashboard
- `src/components/admin/AdminSupport.tsx` -- Admin ticket management
- `supabase/functions/create-admin/index.ts` -- Edge function to create admin account
- `supabase/functions/admin-reset-password/index.ts` -- Edge function for password reset

### Modified Files
- `src/pages/Dashboard.tsx` -- Add "Support" tab to sidebar and render SupportTab
- `src/pages/Admin.tsx` -- Add "Support" tab and password reset dialog
- `src/components/landing/Navbar.tsx` -- Update support link
- `src/App.tsx` -- Add `/support` route
- `src/components/landing/Footer.tsx` -- Update support link

### Database Migration
- Create `support_tickets` table with appropriate columns and RLS policies

