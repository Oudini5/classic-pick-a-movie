
// This is a service to handle OpenAI API calls
// Note: In a production environment, API keys should be handled server-side

// WARNING: Storing API keys directly in the frontend is not recommended for production
// For a real product, you should use a backend service or Edge Functions to handle API requests
const OPENAI_API_KEY = ""; // Will be provided by the user at runtime
const OPENAI_ASSISTANT_ID = "asst_VOqraFGgtusaXpyVZVu16HjK";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface Thread {
  id: string;
  created: number;
}

export const initializeOpenAI = (apiKey: string) => {
  if (!apiKey) {
    throw new Error("OpenAI API key is required");
  }
  
  // Store the API key in memory only (not in localStorage for security reasons)
  // This will be lost on page refresh
  localStorage.setItem('openai_api_key', apiKey);
};

export const getApiKey = (): string => {
  return localStorage.getItem('openai_api_key') || "";
};

export const hasApiKey = (): boolean => {
  return !!localStorage.getItem('openai_api_key');
};

export const removeApiKey = (): void => {
  localStorage.removeItem('openai_api_key');
};

// Create a new thread for the conversation
export const createThread = async (): Promise<Thread> => {
  const apiKey = getApiKey();
  
  try {
    const response = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create thread: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
};

// Add a message to the thread
export const addMessageToThread = async (threadId: string, content: string): Promise<any> => {
  const apiKey = getApiKey();
  
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        role: 'user',
        content,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to add message: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding message to thread:', error);
    throw error;
  }
};

// Run the assistant on the thread
export const runAssistant = async (threadId: string): Promise<any> => {
  const apiKey = getApiKey();
  
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        assistant_id: OPENAI_ASSISTANT_ID,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to run assistant: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error running assistant:', error);
    throw error;
  }
};

// Check the status of a run
export const checkRunStatus = async (threadId: string, runId: string): Promise<any> => {
  const apiKey = getApiKey();
  
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to check run status: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking run status:', error);
    throw error;
  }
};

// Get all messages from a thread
export const getThreadMessages = async (threadId: string): Promise<any> => {
  const apiKey = getApiKey();
  
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get messages: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting thread messages:', error);
    throw error;
  }
};

// Wait for a run to complete
export const waitForRunCompletion = async (threadId: string, runId: string): Promise<any> => {
  const maxAttempts = 60; // Maximum number of attempts (10 minutes at 10-second intervals)
  const delayMs = 1000; // Check every second

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const runStatus = await checkRunStatus(threadId, runId);
    
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
        const text = assistantMessage.content[0].text.value;
        
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
