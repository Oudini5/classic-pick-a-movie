const fetch = require('node-fetch');

// This function runs on a schedule to keep the OpenAI proxy function warm
exports.handler = async function(event, context) {
  console.log('Executing warm-up ping at:', new Date().toISOString());
  
  try {
    // Determine the base URL for the function
    // In production, this will be the deployed Netlify URL
    // In development, we'll use a localhost URL
    const baseUrl = process.env.NETLIFY_URL || process.env.URL || 'http://localhost:8888';
    const functionUrl = `${baseUrl}/.netlify/functions/openai-proxy?health=check`;
    
    console.log(`Pinging function at: ${functionUrl}`);
    
    // Send a GET request to the health check endpoint
    const response = await fetch(functionUrl);
    const data = await response.json();
    
    console.log('Warm-up ping response:', data);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Warm-up ping successful',
        pingTime: new Date().toISOString(),
        targetFunction: 'openai-proxy',
        response: data
      })
    };
  } catch (error) {
    console.error('Error during warm-up ping:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Warm-up ping failed',
        error: error.message
      })
    };
  }
};
