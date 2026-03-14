# Deploy to GitHub Pages

This Next.js app is set up for **static export** and can be deployed to **GitHub Pages**.

## One-time setup

1. **Push the repo to GitHub** (if you haven’t already).

2. **Turn on GitHub Pages from Actions**
   - Open the repo on GitHub → **Settings** → **Pages**.
   - Under **Build and deployment**, set **Source** to **GitHub Actions**.

3. **Deploy**
   - Push to the `main` branch, or run the workflow manually: **Actions** → **Deploy to GitHub Pages** → **Run workflow**.

After the workflow finishes, the site will be at:

**`https://<your-username>.github.io/<repo-name>/`**

Example: if the repo is `ishhar-in-shaa-allah`, the URL is  
`https://yourusername.github.io/ishhar-in-shaa-allah/`

## Local build (same as GitHub)

```bash
# With basePath (like on GitHub Pages):
set NEXT_PUBLIC_BASE_PATH=/%REPO_NAME%
npm run build

# Output is in the "out" folder. Serve it with any static server.
```

## Notes

- **API routes** (`/api/rsvp`, `/api/quiz-submit`) are **not** available on GitHub Pages (static hosting). The app uses **EmailJS** in the browser for RSVP and quiz emails, so it works without a server.
- **Environment variables**: So the built site can send emails, add these in the repo under **Settings** → **Secrets and variables** → **Actions** → **Variables** (not Secrets, so they’re available at build time):
  - `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
  - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
  - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`
  - `NEXT_PUBLIC_MARRIAGE_DATE` (optional, for the countdown)
  If these are missing, the build still runs but email (RSVP, quiz) won’t work on the deployed site until you add them and redeploy.
