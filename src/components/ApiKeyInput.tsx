
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { initializeOpenAI, hasApiKey, removeApiKey } from '@/services/openai';

interface ApiKeyInputProps {
  onApiKeySet: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInput, setShowInput] = useState(!hasApiKey());

  const handleSetApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide an OpenAI API key',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      initializeOpenAI(apiKey);
      setShowInput(false);
      onApiKeySet();
      toast({
        title: 'Success',
        description: 'API key set successfully',
      });
    } catch (error) {
      console.error('Error setting API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to set API key',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveApiKey = () => {
    removeApiKey();
    setShowInput(true);
    setApiKey('');
    toast({
      title: 'Info',
      description: 'API key removed',
    });
  };

  if (!showInput) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-lg border border-white/10 text-center">
        <p className="text-white/70">API key is set</p>
        <Button
          variant="destructive"
          onClick={handleRemoveApiKey}
          className="w-full"
        >
          Remove API Key
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
      <p className="text-white/70 text-sm mb-2">
        Enter your OpenAI API key to use the AI Movie Picker. 
        Your key is stored in your browser only and not sent to our servers.
      </p>
      <div className="flex flex-col gap-2">
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="bg-white/10 border-white/20 text-white"
          disabled={isSubmitting}
        />
        <Button
          onClick={handleSetApiKey}
          disabled={isSubmitting || !apiKey.trim()}
          className="w-full bg-cinema-red hover:bg-cinema-red/90"
        >
          {isSubmitting ? 'Setting API Key...' : 'Set API Key'}
        </Button>
      </div>
    </div>
  );
};

export default ApiKeyInput;
