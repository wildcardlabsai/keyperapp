

# Keyper: Full Polish and Production Upgrade Plan

## Part 1: Design Fixes

### Grid Pattern Issue
The `hero-gradient` grid pattern is applied only to the Hero and CTA sections via `absolute inset-0`, creating a hard cut-off where each section ends. The fix is to:

- Apply the grid pattern to the **entire page background** instead of individual sections, so it flows seamlessly from top to bottom
- Add a subtle radial gradient overlay so the grid fades naturally toward the edges and bottom rather than stopping abruptly
- Use a layered approach: full-page grid at low opacity + localised glows per section

### Other Visual Improvements
- **Smooth section transitions**: Remove hard `border-t` dividers between sections; use spacing and subtle background shifts instead
- **Add entrance animations**: Fade-in-up on scroll for feature cards, "How it works" steps, and CTA using the existing `animate-fade-in` keyframe with intersection observer
- **Code block polish**: Add a subtle cyan glow shadow around the encryption code snippet card
- **Button hover states**: Add scale + glow transitions on the primary CTA buttons
- **Navbar**: Add a frosted glass blur effect (`backdrop-blur`) with slight background opacity on scroll
- **Feature cards**: Add subtle hover lift effect with glow
- **Footer**: Refine spacing, add a top gradient fade separator instead of a hard border

---

## Part 2: Making It a Working Platform

Currently **everything is mock data in localStorage** with no database tables, no real encryption, and no role-based access. Here is what needs to happen:

### A. Database Schema (Migrations)

Create these tables with proper RLS:

1. **`profiles`** - stores user metadata
   - `id` (uuid, references auth.users)
   - `email` (text)
   - `plan` (text, default 'free')
   - `vault_created` (boolean, default false)
   - `auto_lock_minutes` (integer, default 10)
   - `created_at` (timestamptz)

2. **`api_keys`** - stores encrypted API keys
   - `id` (uuid, primary key)
   - `user_id` (uuid, references auth.users)
   - `name` (text)
   - `service` (text)
   - `environment` (text)
   - `encrypted_key` (text) - AES-GCM ciphertext
   - `iv` (text) - initialisation vector
   - `tags` (text)
   - `notes_encrypted` (text)
   - `notes_iv` (text)
   - `created_at` (timestamptz)

3. **`activity_log`** - security audit trail
   - `id` (uuid)
   - `user_id` (uuid, references auth.users)
   - `action` (text)
   - `created_at` (timestamptz)

4. **`user_roles`** - admin role management
   - `id` (uuid)
   - `user_id` (uuid, references auth.users)
   - `role` (app_role enum: admin, user)

5. **`announcements`** - admin-managed banners
   - `id` (uuid)
   - `message` (text)
   - `active` (boolean)
   - `created_at` (timestamptz)

All tables get RLS policies so users can only access their own data. A `has_role()` security-definer function handles admin checks without recursion.

### B. Client-Side Encryption (Web Crypto API)

Create a `src/lib/crypto.ts` utility module:

- **`deriveKey(passphrase, salt)`** - Uses PBKDF2 with SHA-256 and 600,000 iterations to derive an AES-256-GCM key from the vault passphrase
- **`encrypt(plaintext, key)`** - Encrypts with AES-GCM, returns `{ ciphertext, iv }` as base64
- **`decrypt(ciphertext, iv, key)`** - Decrypts and returns plaintext
- The derived key is held in memory only (never persisted to localStorage or sent to the server)
- On vault lock, the key is wiped from memory

### C. Dashboard Refactor

Replace all localStorage/mock logic with real database calls:

- On login, fetch the user's profile from the `profiles` table
- Vault passphrase derives a key in-memory; the passphrase itself is never stored
- Adding a key: encrypt locally, then INSERT the ciphertext into `api_keys`
- Revealing a key: decrypt locally using the in-memory derived key
- Deleting/editing: standard database operations on `api_keys`
- Activity log: INSERT into `activity_log` on each action
- Plan limits enforced by counting rows in `api_keys` for the user

### D. Export/Import Backup

- **Export**: Fetch all encrypted rows from `api_keys`, bundle into a JSON file with metadata, and trigger a browser download
- **Import**: Parse the JSON, validate structure, and INSERT rows into `api_keys` (data stays encrypted throughout)

### E. Admin Panel

- Protected by checking `has_role(auth.uid(), 'admin')` via a database query on page load
- Users list: query `profiles` joined with a count of `api_keys` (admins never see the actual key values since only ciphertext is stored)
- Metrics: aggregate queries (total users, total keys, new users in 7 days)
- Plan management: update `profiles.plan` for a given user
- Announcement management: CRUD on `announcements` table

### F. Auth Guard and Route Protection

- Create a reusable `<ProtectedRoute>` component that checks auth session
- Create an `<AdminRoute>` component that additionally checks the user's role
- Wrap `/dashboard` with `ProtectedRoute`
- Wrap `/admin` with `AdminRoute`
- Auto-create a profile row on first sign-up using a database trigger (`on auth.users insert -> insert into profiles`)

### G. Settings Enhancements

- **Change password**: Use `supabase.auth.updateUser({ password })`
- **Delete account**: Cascade delete all user data via an edge function (delete api_keys, activity_log, profile, then auth user)
- **Auto-lock timing**: Persist to `profiles.auto_lock_minutes`

---

## Implementation Order

1. **Design fixes** - grid pattern, animations, hover effects, navbar blur
2. **Database migrations** - all tables, RLS policies, triggers, `has_role()` function
3. **Crypto module** - `src/lib/crypto.ts` with derive/encrypt/decrypt
4. **Dashboard refactor** - wire up real DB + encryption for keys, activity log, profile
5. **Export/Import** - real encrypted backup download and restore
6. **Admin panel** - role-based protection, real user/metrics queries
7. **Route guards** - `ProtectedRoute` and `AdminRoute` components
8. **Settings** - change password, delete account, persist auto-lock

---

## Technical Notes

- The database has **zero tables** currently, so everything needs to be created from scratch
- All API key values are encrypted client-side before touching the database -- the server only ever stores ciphertext
- The vault passphrase is never transmitted or stored; it exists only in browser memory while the vault is unlocked
- RLS policies ensure complete data isolation between users
- Admin queries use a `security definer` function to avoid RLS recursion

