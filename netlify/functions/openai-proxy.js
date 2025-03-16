
const fetch = require('node-fetch');

// OpenAI API endpoints
const OPENAI_API_URL = 'https://api.openai.com/v1';

exports.handler = async function(event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' }),
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    const { endpoint, method, payload } = body;

    if (!endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing endpoint parameter' }),
      };
    }

    // Validate the endpoint to prevent arbitrary API access
    const validEndpoints = ['threads', 'threads/{thread_id}/messages', 'threads/{thread_id}/runs'];
    const isValidEndpoint = validEndpoints.some(valid => {
      // Replace placeholders like {thread_id} with actual values from the endpoint
      const pattern = valid.replace(/\{([^}]+)\}/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(endpoint) || valid === endpoint;
    });

    if (!isValidEndpoint) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Invalid endpoint requested' }),
      };
    }

    // Get API key from environment variables
    const openAiApiKey = process.env.OPENAI_API_KEY;
    const assistantId = process.env.OPENAI_ASSISTANT_ID;

    if (!openAiApiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured on server' }),
      };
    }

    // Prepare the request to OpenAI
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openAiApiKey}`,
      'OpenAI-Beta': 'assistants=v2'
    };

    // Modify payload if it includes assistant_id placeholder
    if (payload && payload.assistant_id === '{assistant_id}') {
      payload.assistant_id = assistantId;
    }

    // Make the request to OpenAI
    const url = `${OPENAI_API_URL}/${endpoint}`;
    console.log(`Making request to: ${url}`);

    const requestOptions = {
      method: method || 'POST',
      headers: requestHeaders,
      body: payload ? JSON.stringify(payload) : undefined,
    };

    const response = await fetch(url, requestOptions);
    const data = await response.json();

    // Return the response from OpenAI
    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error in OpenAI proxy function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Unknown server error' }),
    };
  }
};
