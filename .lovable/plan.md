

## Feature Plan: 4 New Features for Keyper

### 1. Team/Organization Vaults (Shared Keys)

**Concept**: Users can create "teams," invite members by email, and share encrypted API keys within a shared vault. Each team has roles: owner, editor, viewer.

**Database changes**:
- `teams` table: id, name, created_by (user_id), created_at
- `team_members` table: id, team_id, user_id, role (owner/editor/viewer), invited_at, accepted
- `team_keys` table: same structure as `api_keys` but with `team_id` instead of `user_id`, plus `added_by`
- RLS policies ensuring only team members can access team keys, owners can manage members

**New files**:
- `src/pages/TeamDashboard.tsx` -- team vault view
- `src/components/dashboard/TeamsTab.tsx` -- list of teams in user dashboard sidebar
- `src/components/dashboard/InviteMemberDialog.tsx` -- invite modal
- `supabase/functions/invite-team-member/index.ts` -- sends invite, creates pending record

**Modified files**:
- `src/pages/Dashboard.tsx` -- add "Teams" tab to sidebar
- `src/App.tsx` -- add `/team/:id` route

**Encryption consideration**: Team keys would need a shared encryption approach. Options:
- Each team has its own passphrase that members must know
- Or keys are re-encrypted per-member using their individual vault key (more complex but more secure)

I recommend the **team passphrase** approach for simplicity -- team owners set it, share it out-of-band with members.

---

### 2. API Key Expiry & Rotation Alerts

**Concept**: Users can optionally set an expiration date when adding/editing a key. The dashboard shows warnings for keys expiring within 7 days. A scheduled function checks daily and could send email alerts.

**Database changes**:
- Add `expires_at` (timestamp, nullable) column to `api_keys` table

**Modified files**:
- `src/components/dashboard/AddKeyDialog.tsx` -- add optional date picker for expiry
- `src/pages/Dashboard.tsx`:
  - Overview tab shows "Expiring Soon" warning cards for keys within 7 days
  - Keys list shows expiry badges (green/yellow/red)
- `supabase/functions/check-expiring-keys/index.ts` -- daily cron function that queries keys expiring in 7 days (optional email notification)

**UI indicators**:
- Green badge: >30 days or no expiry
- Yellow badge: 7-30 days
- Red badge: <7 days or expired

---

### 3. Changelog / What's New Page

**Concept**: A public `/changelog` page showing product updates in a clean timeline format. Entries are hardcoded initially but could later be managed from the admin panel.

**New files**:
- `src/pages/Changelog.tsx` -- timeline-style page with version entries
- `src/lib/changelogData.ts` -- array of changelog entries (date, version, title, description, tags like "feature", "fix", "improvement")

**Modified files**:
- `src/App.tsx` -- add `/changelog` route
- `src/components/landing/Navbar.tsx` -- add "Changelog" link
- `src/components/landing/Footer.tsx` -- add "Changelog" link

**Design**: Clean vertical timeline with date markers, version badges, and categorized entries. Could include a "New" badge in the navbar when there are recent updates.

---

### 4. Onboarding Tour & Empty States

**Concept**: First-time users get a step-by-step guided tour highlighting key features. Empty states show helpful illustrations and CTAs instead of blank screens.

**Implementation approach**:
- Track onboarding completion in `profiles` table (`onboarding_completed` boolean column)
- Use a lightweight tooltip/spotlight overlay (custom built, no heavy library)
- Tour steps: (1) Welcome, (2) "Add your first key" button, (3) Sidebar navigation, (4) Security settings

**Database changes**:
- Add `onboarding_completed` (boolean, default false) to `profiles` table

**New files**:
- `src/components/dashboard/OnboardingTour.tsx` -- overlay component with step-by-step tooltips
- `src/components/dashboard/EmptyState.tsx` -- reusable empty state component with illustration, title, description, CTA

**Modified files**:
- `src/pages/Dashboard.tsx` -- render OnboardingTour on first login, use EmptyState when no keys exist

**Empty state designs for**:
- No API keys yet: "Your vault is empty" with illustration + "Add your first key" button
- No activity log entries: "No activity yet"
- No support tickets: "All clear! No tickets."

---

### Suggested Implementation Order

1. **Onboarding tour & empty states** -- quick win, improves UX immediately
2. **API key expiry & rotation alerts** -- single table change, high practical value
3. **Changelog page** -- static content, quick to build
4. **Team vaults** -- most complex, involves shared encryption design

