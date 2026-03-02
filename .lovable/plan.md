

# Add Two-Factor Authentication (TOTP)

## Overview

Lovable Cloud's auth system has built-in support for TOTP-based 2FA (Time-based One-Time Passwords), compatible with apps like Google Authenticator, Authy, and 1Password. No external services or API keys needed.

## How It Works

1. **Enrollment**: User goes to Settings, clicks "Enable 2FA". We call the auth API to generate a TOTP secret, display a QR code they scan with their authenticator app, then verify one code to confirm setup.

2. **Login challenge**: After entering email/password, if the user has 2FA enabled, they're prompted for a 6-digit code from their authenticator app before being granted access.

3. **Management**: Users can unenroll from 2FA in Settings.

## Implementation Steps

### 1. Create a 2FA Settings Component
- New file: `src/components/dashboard/TwoFactorSetup.tsx`
- Shows current 2FA status (enabled/disabled)
- "Enable 2FA" button triggers enrollment flow:
  - Calls `supabase.auth.mfa.enroll({ factorType: 'totp' })` to get a QR code URI
  - Displays QR code for user to scan
  - Asks user to enter a verification code to confirm
  - Calls `supabase.auth.mfa.challengeAndVerify()` to finalize
- "Disable 2FA" button calls `supabase.auth.mfa.unenroll({ factorId })`

### 2. Update Login Flow
- After successful `signInWithPassword`, check if MFA is required by inspecting the auth response
- If the session's `aal` (Authenticator Assurance Level) is `aal1` but the user has enrolled factors, show a TOTP input screen
- User enters 6-digit code, we call `supabase.auth.mfa.challengeAndVerify()` to elevate to `aal2`
- Only then navigate to `/dashboard`

### 3. Update Route Guard
- Modify `ProtectedRoute` to check the session's assurance level
- If user has MFA factors but session is only `aal1`, redirect to a `/verify-2fa` page instead of the dashboard

### 4. Create Verify 2FA Page
- New file: `src/pages/Verify2FA.tsx`
- Simple centered form with 6-digit OTP input (using the existing `InputOTP` component)
- On submit, calls challenge and verify, then navigates to dashboard
- Add route in `App.tsx`

### 5. Wire Into Dashboard Settings
- Add the `TwoFactorSetup` component to the Settings tab in the Dashboard
- Place it in the Security section alongside the existing password change feature

## Technical Details

Key Supabase MFA APIs used:
- `supabase.auth.mfa.enroll()` -- generates TOTP secret + QR URI
- `supabase.auth.mfa.challenge()` -- creates a challenge for a factor
- `supabase.auth.mfa.verify()` -- verifies a TOTP code against a challenge
- `supabase.auth.mfa.unenroll()` -- removes a factor
- `supabase.auth.mfa.getAuthenticatorAssuranceLevel()` -- checks current AAL

No database changes are needed -- MFA factors are managed entirely within the auth system.

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/dashboard/TwoFactorSetup.tsx` | Create -- enrollment/unenrollment UI |
| `src/pages/Verify2FA.tsx` | Create -- post-login TOTP verification page |
| `src/pages/Login.tsx` | Modify -- check for MFA after password login |
| `src/components/auth/RouteGuards.tsx` | Modify -- check AAL level |
| `src/App.tsx` | Modify -- add `/verify-2fa` route |
| `src/pages/Dashboard.tsx` | Modify -- add TwoFactorSetup to Settings tab |

