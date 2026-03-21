# MHStreams Free Setup Guide

This guide explains how to host **MHStreams** completely for free using a persistent database and a high-performance server. This setup ensures your configurations are saved forever and the addon is always responsive.

## 🏗️ The Technology Stack
*   **Server:** [Koyeb](https://www.koyeb.com/) (Nano Tier - $0.00/mo) - Stays active 24/7.
*   **Database:** [Supabase](https://supabase.com/) (Free Tier - $0.00/mo) - Keeps your settings persistent.
*   **Source:** Your GitHub Repository.

---

## Step 1: Create a Persistent Database (Supabase)
Free hosting services like Koyeb use "ephemeral" storage, meaning any files you save (like a local SQLite database) are deleted every time the server restarts. To avoid losing your settings, you must use an external database.

1.  Sign up at [Supabase](https://supabase.com/).
2.  Click **New Project** and give it a name (e.g., `mhstreams-db`).
3.  Set a strong **Database Password** and **save it somewhere**!
4.  Once the project is provisioned, go to **Project Settings** (gear icon) > **Database**.
5.  Scroll down to **Connection String**, select **URI**, and copy the link.
    *   It will look like this: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres`
    *   **Crucial:** Replace `[YOUR-PASSWORD]` with the password you created in step 3.

---

## Step 2: Generate a Secret Key
MHStreams requires a 64-character hex string to encrypt your sessions and sensitive data.

1.  Open your terminal and run:
    ```bash
    openssl rand -hex 32
    ```
2.  **Copy the output.** If you don't have a terminal, use an [online hex generator](https://onlinetools.com/crypto/generate-random-hexadecimal-numbers) to generate a 64-character string.

---

## Step 3: Deploy to Koyeb
Koyeb is the best free option because it doesn't "sleep" like Render or Heroku, meaning Stremio won't timeout while waiting for the addon to wake up.

1.  Sign up at [Koyeb](https://app.koyeb.com/).
2.  Click **Create Service** and select **GitHub**.
3.  Choose your MHStreams repository.
4.  **Deployment Settings:**
    *   **Instance:** Select **Nano** ($0.00/mo).
    *   **Builder:** Select **Docker**. (The repo contains a `Dockerfile` which Koyeb will use to build the app automatically).
5.  **Environment Variables:** Add the following (Click "Bulk Edit" to paste them or add one by one):
    | Variable | Value |
    | :--- | :--- |
    | `DATABASE_URI` | The URI you copied from Supabase (Step 1). |
    | `SECRET_KEY` | The 64-char hex string you generated (Step 2). |
    | `PORT` | `3201` |
6.  Click **Deploy**.

---

## Step 4: Finalize the Public URL
The addon needs to know its own URL to handle internal redirects and Scrape operations.

1.  Wait for the Koyeb deployment to show a **Healthy** status.
2.  Copy the **Public URL** Koyeb assigned to you (e.g., `https://mhstreams-abcd.koyeb.app`).
3.  Go back to your Service settings in Koyeb > **Environment Variables**.
4.  Add a new variable:
    *   **Name:** `BASE_URL`
    *   **Value:** `https://mhstreams-abcd.koyeb.app` (Your actual Koyeb URL).
5.  **Save and Redeploy.**

---

## Step 5: Access the Configuration Page
1.  Open your browser and go to: `https://your-koyeb-url.koyeb.app/stremio/configure`
2.  Configure your debrid services (Real-Debrid, AllDebrid, etc.) and addons.
3.  Click **Install** to add it to Stremio.

---

## 🛠️ Optional Advanced settings
If you want to protect your configuration page so others can't change your settings:
*   Add `ADDON_PASSWORD` as an environment variable in Koyeb with a password of your choice.

## ❓ Troubleshooting
*   **Deployment fails:** Check the "Runtime Logs" in Koyeb. The most common error is an incorrect `DATABASE_URI` (usually a wrong password or missing `@`).
*   **Addon not loading in Stremio:** Ensure `BASE_URL` is set correctly with `https://`.
*   **scraper error:** Ensure you have provided a valid `SECRET_KEY` of exactly 64 characters.
