<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally and deploy it to the web.

View your app in AI Studio: https://ai.studio/apps/drive/1YWO5rFOx8zU87uKe4sLAGA2mm3jiBeuS

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY`. Create a file named `.env` in the root of the project and add the following line, replacing `YOUR_API_KEY_HERE` with your actual key:
   `GEMINI_API_KEY=YOUR_API_KEY_HERE`
3. Run the app:
   `npm run dev`

## Deploying with Netlify

You can deploy this application for free using Netlify.

**Prerequisites:**
* A [GitHub](https://github.com/) account.
* A [Netlify](https://www.netlify.com/) account.

**Steps:**

1.  **Push to GitHub:**
    *   Create a new repository on your GitHub account.
    *   Follow the instructions on GitHub to push this project's code to your new repository.

2.  **Deploy on Netlify:**
    *   Log in to your Netlify account.
    *   Click on **"Add new site"** and then select **"Import an existing project"**.
    *   Connect to GitHub and authorize Netlify to access your repositories.
    *   Choose the repository you just created.

3.  **Configure Build Settings:**
    *   Netlify will automatically detect the `netlify.toml` file in this project, so the build settings should be pre-filled correctly:
        *   **Build command:** `npm run build`
        *   **Publish directory:** `dist`

4.  **Add Environment Variable:**
    *   This is a crucial step for the AI features to work.
    *   Go to **Site configuration > Build & deploy > Environment**.
    *   Click **"Edit variables"** and add a new variable:
        *   **Key:** `GEMINI_API_KEY`
        *   **Value:** Paste your actual Gemini API key here.
    *   Click **"Save"**.

5.  **Deploy:**
    *   Click the **"Deploy site"** button. Netlify will start building and deploying your application.
    *   Once finished, you will get a public URL for your live application!
