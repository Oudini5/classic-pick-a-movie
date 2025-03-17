
# Setting up Environment Variables in Netlify

To properly deploy this site on Netlify, you need to set up the following environment variables in your Netlify project:

## Serverless Function Environment Variables

For security, we've moved the OpenAI API calls to a Netlify serverless function that keeps your API key private.

1. Log in to your Netlify account and navigate to your site's dashboard
2. Go to **Site settings** > **Build & deploy** > **Environment**
3. Click on **Edit variables** and add the following environment variables:

   - `OPENAI_API_KEY`: Your OpenAI API key
   - `OPENAI_ASSISTANT_ID`: Your OpenAI Assistant ID (format: asst_xxxxxxxxxxxxxxxxxxxxxxxx)

## Function Warm-up Configuration

This project includes a function warm-up mechanism to prevent cold starts:

- `warm-function.js`: A scheduled function that runs every 5 minutes to keep the OpenAI proxy function warm
- `openai-proxy.js`: Contains a health check endpoint that responds quickly without making OpenAI API calls
- Client-side warm-up: The app also sends a warm-up request when it loads and at regular intervals

The warm-up configuration is already set up in `netlify.toml`. No additional configuration is needed.

## Important Notes

- The environment variables are now only used in the serverless function, not in the client-side code
- No API keys will be exposed in the final build output
- This setup passes Netlify's secret scanning
- The serverless function automatically proxies requests to OpenAI without exposing your keys

## Troubleshooting Build Errors

If you encounter build errors:

1. Verify that you've added both environment variables correctly in Netlify
2. Check that the variable names are exactly `OPENAI_API_KEY` and `OPENAI_ASSISTANT_ID` (not prefixed with VITE_)
3. Ensure your API key is valid and has access to the OpenAI Assistants API
4. Try clearing the build cache by going to **Site settings** > **Build & deploy** > **Continuous Deployment** > **Clear cache and deploy site**
5. Check the detailed build logs in Netlify for specific error messages
6. Verify that the "Functions" directory is being deployed correctly

## Troubleshooting Runtime Errors

If the site builds but the chat doesn't work:

1. Check the browser console for any specific error messages
2. Verify that the Netlify function is being called correctly (you should see network requests to /.netlify/functions/openai-proxy)
3. Ensure CORS is properly configured
4. Check the Netlify function logs in the Netlify dashboard
