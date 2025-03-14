// This is a service to handle OpenAI API calls
// Note: In a production environment, API keys should be handled server-side

// OpenAI configuration
const OPENAI_API_KEY = "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";
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

// Function to initialize OpenAI with a provided API key
export const initializeOpenAI = (apiKey: string): void => {
  localStorage.setItem('openai_api_key', apiKey);
};

// Function to remove the stored API key
export const removeApiKey = (): void => {
  localStorage.removeItem('openai_api_key');
};

// Get the embedded API key or the one from localStorage
export const getApiKey = (): string => {
  const storedKey = localStorage.getItem('openai_api_key');
  return storedKey || OPENAI_API_KEY;
};

export const hasApiKey = (): boolean => {
  return !!OPENAI_API_KEY || !!localStorage.getItem('openai_api_key');
};

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

// Create a new thread for the conversation
export const createThread = async (): Promise<Thread> => {
  try {
    const response = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`,
        'OpenAI-Beta': 'assistants=v2'
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
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`,
        'OpenAI-Beta': 'assistants=v2'
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
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`,
        'OpenAI-Beta': 'assistants=v2'
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
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getApiKey()}`,
        'OpenAI-Beta': 'assistants=v2'
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
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getApiKey()}`,
        'OpenAI-Beta': 'assistants=v2'
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
  const maxAttempts = 60; // Maximum number of attempts (60 seconds at 1-second intervals)
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
