# Speakvest.ae — setup guide (no coding needed)

You'll do three things, once:

1. **Put the website files on GitHub** (where the files live)
2. **Connect GitHub to Vercel** (Vercel publishes the files as a live website)
3. **Connect the forms to a Google Sheet** (where leads are stored)

After that, any change you make on GitHub goes live on its own in about a minute.

---

## Part 1 — Put the files on GitHub (10 min)

1. Go to **github.com** and sign in (or create a free account).
2. Click **+** (top right) → **New repository**.
   - Repository name: `speakvest-website`
   - Choose **Private**
   - Tick nothing else → **Create repository**.
3. On the new empty repository page, click **uploading an existing file**.
4. Unzip `speakvest-website.zip` on your computer. Open the unzipped folder, select **everything inside it**
   (index.html, the `assets` folder, the `data` folder, etc.) and **drag it all** into the GitHub upload box.
   > Drag the *contents*, not the folder itself. `index.html` must be at the top level.
5. Wait for all files to finish uploading → scroll down → **Commit changes**.

## Part 2 — Publish on Vercel (5 min)

1. Go to **vercel.com** → **Sign up / Log in with GitHub** (Hobby plan is free).
2. Click **Add New… → Project**.
3. Find `speakvest-website` in the list → **Import**.
   (If you don't see it: click "Adjust GitHub App Permissions" and allow Vercel to see this repository.)
4. Settings:
   - Framework Preset: **Other**
   - Leave Build Command and Output Directory **empty**
5. Click **Deploy**. After ~30 seconds you get a live link like `speakvest-website.vercel.app`. Open it and click around.

### Your own domain (when ready)
Vercel → your project → **Settings → Domains** → type `speakvest.ae` → **Add**.
Vercel shows 1–2 DNS records. Add them where you bought the domain (e.g. GoDaddy, Namecheap, Etisalat/du registrar).
It usually goes live within an hour. Vercel adds the free HTTPS certificate automatically.

## Part 3 — Send form leads to Google Sheets (10 min)

1. Go to **sheets.google.com** → create a blank sheet → name it `Speakvest Leads`.
2. In the sheet: **Extensions → Apps Script**.
3. Delete the code you see. Open `apps-script/Code.gs` from the website files, copy **all** of it, paste it in.
4. Optional: to get an email for every lead, put your email between the quotes on the line
   `var NOTIFY_EMAIL = '';`
5. Click the **Save** (disk) icon.
6. Click **Deploy → New deployment**.
   - Click the gear ⚙ next to "Select type" → **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** → **Authorize access** → choose your Google account → **Advanced → Go to (unsafe) → Allow**
     (Google shows this warning for every personal script; it's your own script.)
7. Copy the **Web app URL** (it ends in `/exec`).
8. On GitHub, open `data/site.json` → click the ✏️ pencil → find `"formEndpoint": ""` and paste the URL between the quotes:
   `"formEndpoint": "https://script.google.com/macros/s/AKfy.../exec",`
   → **Commit changes**.
9. Wait one minute, open your live site, submit a test form. A new row appears in the **Leads** tab of your sheet.

> **Later, moving to a CRM:** replace the `formEndpoint` URL with your CRM's webhook URL (or keep Google Sheets
> and ask us to add a forward from the script to the CRM). Nothing else on the site changes.

---

## WhatsApp
All WhatsApp buttons use the number and message templates in `data/site.json` → `"whatsapp"`.
Words in `{curly brackets}` are filled in automatically (project name, the visitor's budget, a calculator result…).
Change the wording any time and commit.

## If something looks broken after an edit
Usually it's a missing comma or quote in a `.json` file. On GitHub, open the file → **History** → open the last
good version → copy its content back. Or send us the file and we'll fix it.
