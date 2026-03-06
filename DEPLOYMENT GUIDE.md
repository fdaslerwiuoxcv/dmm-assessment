# NTT DATA DMM Assessment Tool — Deployment Guide
### Netlify Drop Deploy · Step-by-Step

---

## What You'll Need

- A computer with internet access (Windows, Mac, or Linux)
- About 20–30 minutes
- Your **Anthropic API key** (see Step 1)
- A free **Netlify account** (see Step 5)

---

## Step 1 — Get Your Anthropic API Key

The AI features (goal analysis, executive summary, recommendations) require
an Anthropic API key. This is like a password that lets the app call Claude.

1. Go to **https://console.anthropic.com**
2. Sign in or create a free account
3. Click **"API Keys"** in the left sidebar
4. Click **"Create Key"**
5. Give it a name like `DMM Assessment Tool`
6. **Copy the key immediately** — you won't be able to see it again
   - It will look like: `sk-ant-api03-xxxxxxxxxxxxxxxxxxxx`
7. Paste it somewhere safe temporarily (e.g. a Notepad file on your desktop)

> **Note on cost:** API calls are charged per use. A complete assessment session
> with AI narrative + recommendations costs roughly $1–2 total. See the project
> README for a full cost breakdown.

---

## Step 2 — Install Node.js

Node.js is the tool that compiles the app into files a browser can serve.
You only need to install it once.

1. Go to **https://nodejs.org**
2. Click the **"LTS"** download button (the one labelled "Recommended for most users")
3. Run the installer and click through the defaults
4. When it finishes, open a **Terminal** (Mac/Linux) or **Command Prompt** (Windows):
   - **Mac:** Press `Cmd + Space`, type `Terminal`, press Enter
   - **Windows:** Press `Win + R`, type `cmd`, press Enter
5. Type the following and press Enter to confirm Node.js installed correctly:
   ```
   node --version
   ```
   You should see something like `v20.11.0`. If you do, you're good to go.

---

## Step 3 — Unzip and Open the Project

1. Locate the file **`dmm-deploy-project.zip`** (provided separately)
2. Unzip it — you'll get a folder called **`dmm-deploy`**
3. Move that folder somewhere easy to find, e.g.:
   - **Mac:** your Desktop or Documents folder
   - **Windows:** your Documents folder

---

## Step 4 — Build the App

This step compiles the app into browser-ready files. You only need to do
this once (or whenever the app is updated).

### 4a — Open a terminal in the project folder

**Mac:**
1. Open Terminal
2. Type `cd ` (with a space after it), then drag the `dmm-deploy` folder
   from Finder into the Terminal window — it will fill in the path
3. Press Enter

**Windows:**
1. Open File Explorer and navigate to the `dmm-deploy` folder
2. Click the address bar at the top, type `cmd`, and press Enter
   — a Command Prompt opens already in that folder

### 4b — Install dependencies

Type this and press Enter:
```
npm install
```
You'll see a lot of text scroll by. Wait for it to finish (takes 30–60 seconds).
You'll know it's done when you see the cursor again.

### 4c — Set your API key and build

**Mac/Linux** — type this as one line, replacing the placeholder with your real key:
```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here npm run build
```

**Windows Command Prompt** — you need two commands:
```
set VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
npm run build
```

Wait for the build to finish. When you see:
```
✓ built in X.Xs
```
...you're done. A new folder called **`dist`** has appeared inside `dmm-deploy`.
That's the folder you'll upload to Netlify.

---

## Step 5 — Deploy to Netlify

### 5a — Create a free Netlify account (if you don't have one)

1. Go to **https://netlify.com**
2. Click **"Sign up"**
3. Sign up with your email or GitHub account

### 5b — Drop deploy

1. Once logged in, you'll see your Netlify dashboard
2. Scroll down — you'll see a grey box that says:
   **"Want to deploy a new site without connecting to Git?
   Drag and drop your site output folder here"**
3. Open File Explorer / Finder and navigate into your `dmm-deploy` folder
4. Find the **`dist`** folder inside it
5. **Drag the `dist` folder** and drop it onto that grey box in Netlify

Netlify will upload and deploy in about 10–20 seconds. When it's done
you'll see a green banner and a URL like:
```
https://luminous-sundae-3a9f1b.netlify.app
```

That's your live app. Click it to confirm it loads correctly.

---

## Step 6 — Rename Your Site (Optional but Recommended)

The auto-generated URL isn't very memorable. Here's how to change it:

1. From your Netlify dashboard, click on your new site
2. Click **"Site configuration"** in the left sidebar
3. Click **"Change site name"**
4. Enter something like `nttdata-dmm-assessment`
5. Click **"Save"**

Your site will now be at:
```
https://nttdata-dmm-assessment.netlify.app
```

---

## Step 7 — Share the Link

Copy your Netlify URL and share it with whoever needs access. Anyone with
the link can use the tool — no login to Netlify is required for users.

---

## Updating the App in the Future

When you receive an updated version of `dmm-assessment-app.jsx`:

1. Replace the file at `dmm-deploy/src/App.jsx` with the new version
2. Run the build command again (Step 4c)
3. Drag and drop the new `dist` folder onto your Netlify site's deploy page:
   - Go to your site on Netlify
   - Click **"Deploys"** in the top nav
   - You'll see the same drag-and-drop box — drop the new `dist` folder there

Your URL stays the same. The update goes live in seconds.

---

## Troubleshooting

**"command not found: node"**
Node.js didn't install correctly. Restart your terminal and try `node --version`
again. If it still fails, re-download from nodejs.org and run the installer again.

**"npm install" fails with permission errors (Mac)**
Try: `sudo npm install` and enter your Mac password when prompted.

**The site loads but AI features don't work**
Your API key may be incorrect or missing. Redo Step 4c carefully — make sure
there are no spaces around the `=` sign and that the full key is included.
Then rebuild and redeploy.

**"VITE_ANTHROPIC_API_KEY is not defined" warning in the build**
You didn't include the API key in the build command. Redo Step 4c.

**The Netlify URL shows "Page Not Found"**
You may have dropped the wrong folder. Make sure you dropped the `dist` folder
(not the `dmm-deploy` folder, and not the `src` folder).

---

## Security Note

Your Anthropic API key is baked into the built files. This means:

- Anyone who can access the site can use your API quota
- The key is visible in the browser's source code to technical users

**For internal team use this is acceptable.** If you ever need to revoke access,
go to console.anthropic.com and delete the key — then generate a new one,
rebuild, and redeploy.

For a more locked-down deployment, speak with your IT team about adding
Netlify's password protection feature (available on paid plans) or routing
the API calls through a serverless proxy.

---

*NTT DATA | Data Governance Practice | CMMI DMM Assessment Toolkit*
