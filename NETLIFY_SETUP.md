
# Setting up Environment Variables in Netlify

To properly deploy this site on Netlify, you need to set up the following environment variables in your Netlify project:

1. Log in to your Netlify account and navigate to your site's dashboard
2. Go to **Site settings** > **Build & deploy** > **Environment**
3. Click on **Edit variables** and add the following environment variables:

   - `VITE_OPENAI_API_KEY`: Your OpenAI API key
   - `VITE_OPENAI_ASSISTANT_ID`: Your OpenAI Assistant ID (asst_VOqraFGgtusaXpyVZVu16HjK)

4. Save your changes
5. Trigger a new deployment of your site

## Important Notes

- These environment variables are injected at build time, not run time
- Make sure your API key has access to the Assistants API
- Never expose your API key in client-side code or public repositories

## Troubleshooting

If you encounter the "API key not set" error after setting up the environment variables:

1. Verify that you've added the environment variables correctly in Netlify
2. Make sure you've triggered a new deployment after adding the variables
3. Clear your browser cache or try in an incognito/private window
4. Check the browser console for any specific error messages
