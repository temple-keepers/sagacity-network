# Google Calendar Setup — Service Account Path

**What this does:** gives the Sagacity booking system read + write access to your Google Calendar (`dparris2@gmail.com`) without any OAuth consent flow, verification, or 7-day token expiry. Uses a "service account" — a robot identity with its own permanent credentials.

**Time required:** ~10 minutes.

**What you'll end up with:** two env values (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`) + your calendar shared with that service account + your Zoom Personal Meeting Room URL.

---

## Step 1 — Create the service account

1. Go to https://console.cloud.google.com
2. Make sure **Sagacity Network** is selected in the project dropdown (the existing project you already created is fine — no need to recreate it)
3. Left menu → **IAM & Admin** → **Service Accounts**
4. Top → **+ Create Service Account**
5. Fill in:
   - Service account name: `sagacity-booking`
   - Service account ID: (auto-fills — leave it)
   - Description: `Reads availability and creates bookings in Denise's calendar`
6. Click **Create and Continue**
7. On the "Grant this service account access to project" step → **skip** (click **Continue**)
8. On the "Grant users access" step → **skip** → **Done**

Copy the **Email** column value from the new row — it looks like `sagacity-booking@sagacity-network-xxxxxx.iam.gserviceaccount.com`. Save it; we need it in Step 3.

---

## Step 2 — Generate a key for the service account

1. Click the service account you just created (the email link)
2. Top tabs → **Keys**
3. **Add Key** → **Create new key**
4. Key type: **JSON** → **Create**
5. A JSON file downloads to `C:\Users\sagac\Downloads` (usually named something like `sagacity-network-xxxxxx-abc123.json`)
6. **Do not share this file or commit it to git.** It's the equivalent of a password for the service account.

---

## Step 3 — Share your Google Calendar with the service account

1. Go to https://calendar.google.com (signed in as `dparris2@gmail.com`)
2. On the left, hover over **My calendars** → find your primary calendar
3. Click the three-dot menu next to it → **Settings and sharing**
4. Scroll down to **Share with specific people or groups**
5. Click **+ Add people and groups**
6. Paste the service account email from Step 1 (the `sagacity-booking@...iam.gserviceaccount.com` address)
7. Permission dropdown → choose **Make changes to events**
8. Click **Send** (won't actually email anyone — service accounts have no inbox)

---

## Step 4 — Put the credentials in `.env.local`

Open the JSON file from Step 2 in a text editor. Find these two values:

1. `client_email` — like `sagacity-booking@sagacity-network-xxxxxx.iam.gserviceaccount.com`
2. `private_key` — a long block starting with `-----BEGIN PRIVATE KEY-----\n`

Open `C:\Users\sagac\Sagacity\.env.local` and fill in:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=<paste client_email here>
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="<paste private_key EXACTLY as it appears in the JSON, including surrounding double quotes and \n escapes>"
```

**Important:** copy the private key exactly as in the JSON — including the literal `\n` characters (don't replace them with real newlines) and keep the surrounding double quotes. Example:

```
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...lots of characters...\n-----END PRIVATE KEY-----\n"
```

Save the file.

---

## Step 5 — Add your Zoom Personal Meeting Room link

Still in `.env.local`:

```
MEETING_LINK=<your Zoom Personal Meeting Room URL>
```

Get it from https://zoom.us → **Profile** → **Personal Meeting ID** → copy the full join URL (looks like `https://zoom.us/j/1234567890` or `https://us02web.zoom.us/j/1234567890?pwd=...`).

---

## Step 6 — Confirm

Reply in the chat: **"Calendar ready"** and Claude will:
- Write the calendar library using service account auth
- Test reading your calendar
- Continue with the booking system build

---

## Mirror to Vercel (later)

Once local works, add these to Vercel → Settings → Environment Variables (Production, Preview, Development):

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (paste the whole `"-----BEGIN...END-----\n"` string)
- `GOOGLE_CALENDAR_ID` = `dparris2@gmail.com`
- `MEETING_LINK` = your Zoom PMI URL

---

## Troubleshooting

**"Invalid grant" or auth errors when the app runs** — the private key wasn't pasted correctly. Check:
- Value is wrapped in double quotes in `.env.local`
- The `\n` sequences are literal (two chars: backslash + n), not real newlines
- You copied everything including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

**"Calendar not found" or 404** — service account wasn't shared on the calendar. Redo Step 3; confirm the service account email is in "Share with specific people" with "Make changes to events".

**Accidentally committed the JSON key file** — delete it from git, then rotate the key: in Cloud Console → Service Accounts → your service account → Keys → delete the old key, create a new one, re-paste into `.env.local`.
