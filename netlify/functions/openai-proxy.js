
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
    // Log the incoming request for debugging
    console.log('Received request:', {
      method: event.httpMethod,
      path: event.path,
      headers: event.headers,
    });

    // Parse the request body
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      };
    }

    const { endpoint, method, payload } = body;

    if (!endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing endpoint parameter' }),
      };
    }

    // Validate the endpoint to prevent arbitrary API access
    const validEndpoints = ['threads', 'threads/{thread_id}/messages', 'threads/{thread_id}/runs', 'threads/{thread_id}/runs/{run_id}'];
    const isValidEndpoint = validEndpoints.some(valid => {
      // Replace placeholders like {thread_id} with actual values from the endpoint
      const pattern = valid.replace(/\{([^}]+)\}/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(endpoint) || valid === endpoint;
    });

    if (!isValidEndpoint) {
      console.error('Invalid endpoint requested:', endpoint);
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
      console.error('API key not configured on server');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured on server' }),
      };
    }

    if (!assistantId && endpoint.includes('runs') && payload && payload.assistant_id === '{assistant_id}') {
      console.error('Assistant ID not configured on server');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Assistant ID not configured on server' }),
      };
    }

    // Prepare the request to OpenAI
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openAiApiKey}`,
      'OpenAI-Beta': 'assistants=v2'
    };

    // Create a copy of the payload to modify
    let modifiedPayload = payload ? JSON.parse(JSON.stringify(payload)) : undefined;

    // Modify payload if it includes assistant_id placeholder
    if (modifiedPayload && modifiedPayload.assistant_id === '{assistant_id}') {
      console.log('Replacing assistant_id placeholder with:', assistantId);
      modifiedPayload.assistant_id = assistantId;
    }

    // Make the request to OpenAI
    const url = `${OPENAI_API_URL}/${endpoint}`;
    console.log(`Making request to OpenAI: ${url}, Method: ${method || 'POST'}`);

    const requestOptions = {
      method: method || 'POST',
      headers: requestHeaders,
      body: modifiedPayload ? JSON.stringify(modifiedPayload) : undefined,
    };

    const response = await fetch(url, requestOptions);
    let responseBody;
    
    try {
      responseBody = await response.json();
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      const rawText = await response.text();
      console.error('Raw response:', rawText);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to parse OpenAI response', rawResponse: rawText }),
      };
    }

    // Check for OpenAI API errors
    if (!response.ok) {
      console.error('OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        body: responseBody
      });
    } else {
      console.log('OpenAI API success:', {
        status: response.status,
        endpoint: endpoint
      });
    }

    // Return the response from OpenAI
    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(responseBody),
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
