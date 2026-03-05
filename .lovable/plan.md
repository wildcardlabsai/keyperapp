

## Issues and Fixes

### 1. Passphrase Validation (Security Bug)

**Problem:** The `unlockVault` function in `Dashboard.tsx` (line 341) derives a key from whatever the user types and immediately sets `locked = false`. It never verifies the passphrase is correct. Any input is accepted, and wrong passphrases only surface later as silent decryption failures.

**Root cause:** There is no verification token stored during vault creation to validate against during unlock.

**Fix — store and check a verification ciphertext:**

- **Database migration:** Add two columns to `profiles`:
  - `vault_verify_ciphertext text` (nullable)
  - `vault_verify_iv text` (nullable)

- **Vault creation (`createVault`):** After deriving the key, encrypt a known plaintext string (e.g. `"KEYPER_VAULT_OK"`) and store the resulting ciphertext + IV in the profile alongside `vault_created = true`.

- **Vault unlock (`unlockVault`):** After deriving the key, fetch the stored verification ciphertext/IV from the profile and attempt to decrypt it. If decryption fails (throws), show a "Wrong passphrase" error and do NOT unlock. If it succeeds and matches the expected plaintext, proceed with unlock.

- **Same fix applied to `TeamDashboard.tsx`** `unlockTeam` function — encrypt a verification token when the team is first set up, and validate on unlock. (Requires adding `vault_verify_ciphertext` and `vault_verify_iv` columns to the `teams` table as well.)

### 2. Landing Page Performance

**Problem:** The page feels sluggish due to multiple overlapping animation systems and heavy component imports.

**Fixes:**

- **Lazy-load below-fold sections:** Use `React.lazy` + `Suspense` for `Testimonials`, `PricingTeaser`, `TrustedBy`, and `MobileCTA` so they don't block initial render.

- **Reduce IntersectionObserver count:** The `useCountUp` hook creates one observer per `MetricCard` (4 total), plus `useScrollAnimation` observes every `.animate-on-scroll` element, plus `useInView` for the encryption card. Consolidate: wrap the metrics section in a single `useInView` and trigger all counters together instead of 4 separate observers.

- **Add `will-change: transform` to the `.grid-drift` animation** in CSS to promote it to its own compositor layer and avoid paint overhead.

- **Use `content-visibility: auto`** on below-fold sections (features, how-it-works, testimonials, CTA) to skip rendering until they approach the viewport.

- **Defer the ChatWidget mount** with a `setTimeout` or `requestIdleCallback` so it doesn't compete with initial paint.

### Summary of Changes

| File | Change |
|------|--------|
| DB migration | Add `vault_verify_ciphertext`, `vault_verify_iv` to `profiles` and `teams` |
| `src/pages/Dashboard.tsx` | Store verification token on create, validate on unlock |
| `src/pages/TeamDashboard.tsx` | Same verification pattern for team vaults |
| `src/pages/Landing.tsx` | Lazy-load heavy components, consolidate observers |
| `src/index.css` | Add `will-change: transform` to `.grid-drift`, add `content-visibility: auto` utility |
| `src/App.tsx` | Defer `ChatWidget` mount |

