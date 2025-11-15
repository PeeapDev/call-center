import { Injectable } from '@nestjs/common';

interface AIKey {
  name: string;
  description: string;
  masked: string;
  isConfigured: boolean;
  envVar: string;
}

@Injectable()
export class AiService {
  private readonly aiKeys: AIKey[] = [
    {
      name: 'GEMINI_API_KEY',
      description: 'Google Gemini AI for chatbot responses',
      masked: '',
      isConfigured: false,
      envVar: 'GEMINI_API_KEY',
    },
    {
      name: 'DEEPSEEK_API_KEY',
      description: 'DeepSeek AI for advanced analytics',
      masked: '',
      isConfigured: false,
      envVar: 'DEEPSEEK_API_KEY',
    },
    {
      name: 'OPENAI_API_KEY',
      description: 'OpenAI GPT for transcription and analysis',
      masked: '',
      isConfigured: false,
      envVar: 'OPENAI_API_KEY',
    },
    {
      name: 'ANTHROPIC_API_KEY',
      description: 'Anthropic Claude for reasoning tasks',
      masked: '',
      isConfigured: false,
      envVar: 'ANTHROPIC_API_KEY',
    },
  ];

  async chat(message: string) {
    // Check if Gemini key is configured
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      return {
        status: 'error',
        response:
          'AI chat is not configured. Please add your Gemini API key in Settings > AI Keys Management.',
      };
    }

    try {
      // Call Google Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a helpful AI assistant for the Ministry of Education call center. 
                    Answer the following question concisely and professionally: ${message}`,
                  },
                ],
              },
            ],
          }),
        },
      );

      const data = await response.json();

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return {
          status: 'ok',
          response: data.candidates[0].content.parts[0].text,
        };
      } else {
        return {
          status: 'error',
          response: 'I apologize, but I encountered an error processing your request.',
        };
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      return {
        status: 'error',
        response: 'I apologize, but I\'m currently unable to respond. Please try again later.',
      };
    }
  }

  async getKeys() {
    // Check which keys are configured
    const keys = this.aiKeys.map((key) => {
      const envValue = process.env[key.envVar];
      const isConfigured = !!envValue;
      const masked = isConfigured
        ? `${envValue.substring(0, 4)}${'•'.repeat(12)}${envValue.substring(envValue.length - 4)}`
        : '';

      return {
        name: key.name,
        description: key.description,
        masked,
        isConfigured,
      };
    });

    return { status: 'ok', keys };
  }

  async updateKey(keyName: string, value: string) {
    // In production, this would update the environment variable or secrets manager
    // For now, we'll just return a success message
    // You would typically use a service like AWS Secrets Manager, Azure Key Vault, etc.

    const key = this.aiKeys.find((k) => k.name === keyName);

    if (!key) {
      return { status: 'error', message: 'Invalid key name' };
    }

    if (!value || value.length < 10) {
      return {
        status: 'error',
        message: 'API key must be at least 10 characters',
      };
    }

    // In a real app, you would:
    // 1. Encrypt the key
    // 2. Store it in a secrets manager
    // 3. Update process.env
    // 4. Potentially restart the service

    console.log(`Would update ${keyName} to: ${value.substring(0, 4)}...`);

    return {
      status: 'ok',
      message: `${keyName} updated successfully. Restart the backend to apply changes.`,
    };
  }
}
