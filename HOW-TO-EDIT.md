# Speakvest.ae — how to edit the website

Everything you'll normally change lives in the **`data/`** folder. Edit on GitHub (open file → ✏️ → edit → **Commit changes**);
Vercel republishes in about a minute.

> JSON tips: text goes in "double quotes", items are separated by commas, and the **last item in a list has no comma**.
> Copy an existing item, paste it below, change the text. That's the safest way.

| I want to… | Edit this |
|---|---|
| Change the menu / add a tab | `data/site.json` → `"nav"` |
| Change WhatsApp number or messages | `data/site.json` → `"whatsapp"` |
| Change where forms are sent (Google Sheet → CRM) | `data/site.json` → `"formEndpoint"` |
| Add / edit / hide a project | `data/projects.json` |
| Add / hide a guide | `data/guides.json` (+ upload the PDF to `guides/files/`) |
| Add / edit FAQ | `data/faq.json` |
| Add glossary terms | `data/glossary.json` |
| Show / hide / reorder tools | `data/tools.json` |
| Footer links, disclaimer, social links | `data/site.json` |
| Brand colours | `assets/css/site.css` (top of the file, `:root`) |
| Logo | replace the files in `assets/img/` with the same names |

## Add a project
Copy one project block in `data/projects.json` and change (the ← notes are explanations only, don't copy them):
```json
{
  "slug": "my-new-project",            ← short web name, lowercase, dashes, unique
  "name": "My New Project",
  "developer": "Emaar",
  "area": "Dubai Hills",
  "emirate": "Dubai",
  "types": "Apartment, Townhouse",
  "units": "1–3 BR apartments",
  "priceFrom": 1450000,                ← number without commas, or null for "on request"
  "handover": "Q4 2029",
  "paymentPlan": "80/20 (10% booking, 70% during construction, 20% on handover)",
  "description": "One or two sentences about the project.",
  "amenities": ["Pool", "Gym", "Park"],
  "image": "https://…/main-photo.webp",  ← or upload to assets/img/projects/ and use "assets/img/projects/name.webp"
  "gallery": ["https://…/photo2.webp", "https://…/photo3.webp"],
  "featured": true,                    ← true = shown on the homepage
  "show": true                         ← false = hidden everywhere
}
```
Its page is created automatically at `project.html?p=my-new-project`.

## Add a tab (new page)
1. On GitHub: **Add file → Create new file** → name it e.g. `market-reports.html`.
2. Copy all of `faq.html` into it, change the `<title>`, description and the text inside `<main>`.
3. Add it to the menu in `data/site.json`:
   `{ "label": "Market reports", "href": "market-reports.html" },`

## Add a guide
1. Upload your PDF to `guides/files/` (Add file → Upload files).
2. In `data/guides.json` copy a guide block, change the text, and set
   `"url": "guides/files/your-file.pdf"`.
   Visitors leave their details once, then get the guide link (and the lead goes to your sheet).

## Add a lead form anywhere
Paste this where you want it on any page:
```html
<div data-lead-form="my-form-name" data-title="Get the price list" data-button="Send"></div>
```
`my-form-name` shows in the **formType** column of your Google Sheet so you know where the lead came from.
Optional: `data-fields="name,phone,email,project,budget,timeline,message"` to choose the fields.

## Add a new tool / calculator
Tools are code (`assets/js/tools.js`). Each tool is one block; ask Claude to add a new one, then list its id in
`data/tools.json`. Hiding/reordering existing tools needs only `data/tools.json`.
