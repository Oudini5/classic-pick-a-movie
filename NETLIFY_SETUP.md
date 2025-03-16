
# Setting up Environment Variables in Netlify

To properly deploy this site on Netlify, you need to set up the following environment variables in your Netlify project:

1. Log in to your Netlify account and navigate to your site's dashboard
2. Go to **Site settings** > **Build & deploy** > **Environment**
3. Click on **Edit variables** and add the following environment variables:

   - `VITE_OPENAI_API_KEY`: Your OpenAI API key
   - `VITE_OPENAI_ASSISTANT_ID`: Your OpenAI Assistant ID (asst_VOqraFGgtusaXpyVZVu16HjK)

4. Save your changes
5. Trigger a new deployment of your site by clicking **Deploy site** in the Deploys tab

## Important Notes

- These environment variables are injected at build time, not run time
- Make sure your API key has access to the Assistants API
- Never expose your API key in client-side code or public repositories

## Troubleshooting Build Errors

If you encounter build errors (e.g., "Build script returned non-zero exit code: 2"):

1. Verify that you've added both environment variables correctly in Netlify
2. Check that the variable names are exactly `VITE_OPENAI_API_KEY` and `VITE_OPENAI_ASSISTANT_ID`
3. Ensure your API key is valid and has access to the OpenAI Assistants API
4. Try clearing the build cache by going to **Site settings** > **Build & deploy** > **Continuous Deployment** > **Clear cache and deploy site**
5. Check the detailed build logs in Netlify for specific error messages

## Troubleshooting Runtime Errors

If the site builds but you still see the "API key not set" error:

1. Clear your browser cache or try in an incognito/private window
2. Check the browser console for any specific error messages
3. Verify that environment variables are being correctly injected during build
