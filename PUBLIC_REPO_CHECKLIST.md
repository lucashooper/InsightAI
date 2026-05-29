# Making Insight public on GitHub — security checklist

## Is it worth it?

**Yes**, if you want a portfolio piece — this is a strong full-stack project (React, Expo, Supabase, AI). Just treat “public repo” as **open source code**, not “open user data.”

## Will your private journal notes be in the repo?

**No.** Notes live in **Supabase** (cloud database), not in git. Cloning the repo does **not** give anyone your entries.

They could only read your notes if:

1. They steal **your** Supabase **service role** key (must never be in the repo), or
2. **Row Level Security (RLS)** on `notes` / `daily_check_ins` is misconfigured, or
3. You accidentally commit a **database dump** or export (`.sql`, `.json` backups) — now blocked in `.gitignore`.

Encrypted notes stay encrypted; the encryption password is never stored server-side.

## What was wrong before?

| Issue | Risk |
|--------|------|
| `.env` / `mobile/.env` exist locally but are gitignored | OK if never committed |
| **`GROQ_API_KEY_UPDATED.md` contained a real Groq API key** | **High** — rotate key in [Groq console](https://console.groq.com) |
| Supabase URL + anon key hardcoded in `app.config.js`, `supabaseClient.ts`, scripts | Medium — anon key is “public” by design, but ties repo to **your** project |
| Google OAuth client IDs in `app.config.js` | Low–medium — restrict in Google Cloud Console |
| RevenueCat keys in `mobile/App.tsx` | Medium — rotate if repo was ever public |
| Personal email in several `.md` / `.sql` files | Privacy — not a data leak, but you may want to redact |

## Before you click “Public”

### 1. Rotate exposed secrets (do this even if repo was always private)

- [ ] **Groq** — revoke/regenerate key (was in `GROQ_API_KEY_UPDATED.md`)
- [ ] **Groq** — confirm `GROQ_API_KEY` only in Supabase Edge Function secrets + local `.env`
- [ ] **Supabase** — optional: create a separate “demo” project for the public repo, or keep RLS tight on production
- [ ] **RevenueCat** — rotate if concerned
- [ ] **Google OAuth** — restrict authorized origins/bundle IDs to your apps only

### 2. Git history

If the repo was ever pushed with secrets, `.gitignore` does **not** remove them from **old commits**. Options:

- Use [GitHub secret scanning](https://docs.github.com/en/code-security/secret-scanning) after publish
- Or rewrite history with `git filter-repo` / BFG (advanced), then force-push

### 3. Stop committing real keys in source (recommended follow-up)

Move hardcoded fallbacks out of:

- `mobile/app.config.js`
- `src/services/supabaseClient.ts`
- `mobile/scripts/testEmail.*`

Use `.env` / EAS secrets only; committed code should use placeholders or `process.env` with no real defaults.

### 4. Supabase production safety

- [ ] RLS enabled on `notes`, `profiles`, `daily_check_ins`, etc.
- [ ] No `service_role` key in client or repo
- [ ] Edge function secrets only in Supabase dashboard

### 5. Optional polish for a public portfolio

- [ ] Add a root `README.md` (screenshots, stack, setup from `.env.example`)
- [ ] Redact personal email from docs/SQL (`edwardsjonny547@gmail.com` → `your-admin@example.com`)
- [ ] Remove or ignore internal fix notes (`URGENT_FIXES*.md`, etc.) if you don’t want them public

### 6. Untrack files that should not be in git

```powershell
git rm -r --cached .expo 2>$null
git add .gitignore .env.example PUBLIC_REPO_CHECKLIST.md
git commit -m "Prepare repo for public release: tighten gitignore and redact secrets"
```

## Quick answers

| Question | Answer |
|----------|--------|
| Is `.gitignore` enough alone? | **No** — secrets already in tracked files/history need rotation + cleanup |
| Are my notes safe? | **Yes**, as long as they’re only in Supabase with proper RLS |
| Safe to go public after checklist? | **Yes**, with rotations + RLS verified |
