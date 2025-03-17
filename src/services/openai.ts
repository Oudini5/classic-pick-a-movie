
// This file now uses a Netlify function proxy for OpenAI API calls
// No API keys are stored or used in the client code

// Helper function to replace markdown with HTML
const formatMarkdownToHTML = (text: string): string => {
  // Replace bold formatting
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Replace italic formatting
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Replace emoji markdown (keep them as is)
  formattedText = formattedText.replace(/:\w+:/g, (match) => match);
  
  // Remove code blocks completely
  formattedText = formattedText.replace(/```[\s\S]*?```/g, '');
  
  // Replace inline code with styled span
  formattedText = formattedText.replace(/`(.*?)`/g, '<span class="inline-code">$1</span>');
  
  return formattedText;
};

// Function to warm up the Netlify function to reduce cold start
export const warmupFunction = async (): Promise<boolean> => {
  try {
    console.log('Sending warm-up ping to serverless function');
    const apiUrl = `/.netlify/functions/openai-proxy?health=check`;
    
    const startTime = Date.now();
    const response = await fetch(apiUrl);
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    console.log(`Function warm-up response time: ${responseTime}ms`);
    
    if (!response.ok) {
      console.warn('Warm-up ping failed with status:', response.status);
      return false;
    }
    
    const data = await response.json();
    console.log('Warm-up ping response:', data);
    return true;
  } catch (error) {
    console.error('Error warming up function:', error);
    return false;
  }
};

// Function to call our Netlify serverless function
const callOpenAIProxy = async (endpoint: string, method: string = 'POST', payload?: any): Promise<any> => {
  try {
    const apiUrl = `/.netlify/functions/openai-proxy`;
    console.log(`Making API request to: ${apiUrl} for endpoint: ${endpoint}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint,
        method,
        payload,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText || 'Unknown error occurred' };
      }
      console.error(`API error (${response.status}):`, errorData);
      throw new Error(`API error (${response.status}): ${errorData.error || response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      console.error('Response is not JSON:', text);
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    console.error('Error calling OpenAI proxy:', error);
    throw error;
  }
};

// Create a new thread for the conversation
export const createThread = async (): Promise<any> => {
  try {
    console.log('Creating new thread');
    return await callOpenAIProxy('threads');
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
};

// Add a message to the thread
export const addMessageToThread = async (threadId: string, content: string): Promise<any> => {
  try {
    console.log(`Adding message to thread: ${threadId}`);
    return await callOpenAIProxy(`threads/${threadId}/messages`, 'POST', {
      role: 'user',
      content,
    });
  } catch (error) {
    console.error('Error adding message to thread:', error);
    throw error;
  }
};

// Run the assistant on the thread
export const runAssistant = async (threadId: string): Promise<any> => {
  try {
    console.log(`Running assistant on thread: ${threadId}`);
    return await callOpenAIProxy(`threads/${threadId}/runs`, 'POST', {
      assistant_id: '{assistant_id}', // This will be replaced in the serverless function
    });
  } catch (error) {
    console.error('Error running assistant:', error);
    throw error;
  }
};

// Check the status of a run
export const checkRunStatus = async (threadId: string, runId: string): Promise<any> => {
  try {
    console.log(`Checking run status for run: ${runId} in thread: ${threadId}`);
    return await callOpenAIProxy(`threads/${threadId}/runs/${runId}`, 'GET');
  } catch (error) {
    console.error('Error checking run status:', error);
    throw error;
  }
};

// Get all messages from a thread
export const getThreadMessages = async (threadId: string): Promise<any> => {
  try {
    console.log(`Getting messages from thread: ${threadId}`);
    return await callOpenAIProxy(`threads/${threadId}/messages`, 'GET');
  } catch (error) {
    console.error('Error getting thread messages:', error);
    throw error;
  }
};

// Wait for a run to complete
export const waitForRunCompletion = async (threadId: string, runId: string): Promise<any> => {
  const maxAttempts = 60; // Maximum number of attempts (60 seconds at 1-second intervals)
  const delayMs = 1000; // Check every second

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const runStatus = await checkRunStatus(threadId, runId);
    console.log(`Run status (attempt ${attempt + 1}): ${runStatus.status}`);
    
    if (runStatus.status === 'completed') {
      return runStatus;
    } else if (runStatus.status === 'failed' || runStatus.status === 'cancelled' || runStatus.status === 'expired') {
      throw new Error(`Run ended with status: ${runStatus.status}`);
    }
    
    // Wait before the next check
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  throw new Error('Run timed out');
};

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Process a user message and get the assistant's response
export const processUserMessage = async (threadId: string, userMessage: string): Promise<Message> => {
  try {
    // Add the user message to the thread
    await addMessageToThread(threadId, userMessage);
    
    // Run the assistant on the thread
    const run = await runAssistant(threadId);
    
    // Wait for the run to complete
    await waitForRunCompletion(threadId, run.id);
    
    // Get the messages from the thread
    const messagesResponse = await getThreadMessages(threadId);
    
    // The first message is the most recent one, which should be the assistant's response
    if (messagesResponse.data && messagesResponse.data.length > 0) {
      const assistantMessage = messagesResponse.data.find((msg: any) => msg.role === 'assistant');
      
      if (assistantMessage) {
        let text = assistantMessage.content[0].text.value;
        
        // Format the markdown in the text
        text = formatMarkdownToHTML(text);
        
        return {
          id: assistantMessage.id,
          text,
          sender: 'ai',
          timestamp: new Date(),
        };
      }
    }
    
    throw new Error('No assistant response found');
  } catch (error) {
    console.error('Error processing user message:', error);
    throw error;
  }
};

// Remove functions that accessed env vars directly
export const hasApiKey = (): boolean => true; // Always return true since we're using a server
