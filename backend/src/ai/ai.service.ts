import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import Database from 'better-sqlite3';

interface AIKey {
  name: string;
  description: string;
  masked: string;
  isConfigured: boolean;
  envVar: string;
}

interface TrainingDocument {
  id: string;
  title: string;
  description: string;
  filename: string;
  content: string;
  uploadedAt: Date;
  fileSize: number;
}

@Injectable()
export class AiService {
  private db: Database.Database;
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

  private documents: TrainingDocument[] = [];
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'ai-training');

  constructor() {
    const dbPath = path.join(__dirname, '../../callcenter.db');
    this.db = new Database(dbPath);
    this.initDatabase();
    // Ensure uploads directory exists
    this.initUploadsDir();
    // Load existing documents
    this.loadDocuments();
  }

  private initDatabase() {
    // Create table for AI keys
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ai_keys (
        name TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
  }

  private async initUploadsDir() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create uploads directory:', error);
    }
  }

  private async loadDocuments() {
    try {
      const metadataPath = path.join(this.uploadsDir, 'metadata.json');
      const data = await fs.readFile(metadataPath, 'utf-8');
      this.documents = JSON.parse(data);
    } catch (error) {
      // No existing documents, start fresh
      this.documents = [];
    }
  }

  private async saveDocuments() {
    try {
      const metadataPath = path.join(this.uploadsDir, 'metadata.json');
      await fs.writeFile(metadataPath, JSON.stringify(this.documents, null, 2));
    } catch (error) {
      console.error('Failed to save documents metadata:', error);
    }
  }

  async chat(message: string) {
    // Try to get key from database first, then fall back to environment variable
    let geminiKey = this.getStoredKey('GEMINI_API_KEY');
    if (!geminiKey) {
      geminiKey = process.env.GEMINI_API_KEY || null;
    }

    if (!geminiKey) {
      return {
        status: 'error',
        response:
          'AI chat is not configured. Please add your Gemini API key in Settings > AI Keys Management.',
      };
    }

    try {
      // Get training context from uploaded documents
      const trainingContext = await this.getTrainingContext();
      
      // Build context-aware prompt
      let systemPrompt = `You are a helpful AI assistant for the Ministry of Education call center.`;
      
      if (trainingContext.documents > 0) {
        systemPrompt += `\n\nYou have access to the following official Ministry documents and information:\n\n`;
        systemPrompt += trainingContext.context;
        systemPrompt += `\n\nWhen answering questions, prioritize information from these official documents.`;
      }
      
      systemPrompt += `\n\nIf a question is outside the scope of education or the Ministry of Education, politely respond: "I don't know about that topic, but I'm here to discuss education and the Ministry of Education. If there's anything about education or the Ministry that I can help you with, I'd be glad to assist!"`;

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
                    text: `${systemPrompt}\n\nUser question: ${message}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            },
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

  private getStoredKey(keyName: string): string | null {
    try {
      const stmt = this.db.prepare('SELECT value FROM ai_keys WHERE name = ?');
      const result = stmt.get(keyName) as { value: string } | undefined;
      return result?.value || null;
    } catch (error) {
      return null;
    }
  }

  async getKeys() {
    const keys = this.aiKeys.map((key) => {
      // Check database first, then environment
      const storedValue = this.getStoredKey(key.name);
      const envValue = process.env[key.envVar];
      const actualValue = storedValue || envValue;
      
      const isConfigured = !!actualValue && actualValue.length > 0;
      const masked = isConfigured
        ? `${actualValue.substring(0, 4)}${'•'.repeat(12)}${actualValue.substring(actualValue.length - 4)}`
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

    try {
      const now = new Date().toISOString();
      const stmt = this.db.prepare(`
        INSERT INTO ai_keys (name, value, created_at, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(name) DO UPDATE SET
          value = excluded.value,
          updated_at = excluded.updated_at
      `);
      
      stmt.run(keyName, value, now, now);

      console.log(`✅ Saved ${keyName} to database: ${value.substring(0, 4)}...`);

      return {
        status: 'ok',
        message: `${keyName} saved successfully! AI chat is now ready to use.`,
      };
    } catch (error) {
      console.error('Failed to save API key:', error);
      return {
        status: 'error',
        message: 'Failed to save API key to database',
      };
    }
  }

  // Document Management
  async getDocuments() {
    return {
      status: 'ok',
      documents: this.documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        filename: doc.filename,
        uploadedAt: doc.uploadedAt,
        fileSize: doc.fileSize,
      })),
    };
  }

  async uploadDocument(file: any, title: string, description: string) {
    if (!file) {
      return { status: 'error', message: 'No file provided' };
    }

    try {
      const id = `doc_${Date.now()}`;
      const filename = `${id}_${file.originalname}`;
      const filepath = path.join(this.uploadsDir, filename);

      // Save file
      await fs.writeFile(filepath, file.buffer);

      // Extract text content (for PDFs, you'd use a PDF parser like pdf-parse)
      let content = '';
      if (file.mimetype === 'text/plain') {
        content = file.buffer.toString('utf-8');
      } else if (file.mimetype === 'application/pdf') {
        // For now, just indicate it's a PDF - you'd integrate pdf-parse here
        content = `[PDF Document: ${title}]\n${description}`;
      } else {
        content = description; // Fallback to description
      }

      const document: TrainingDocument = {
        id,
        title,
        description,
        filename,
        content,
        uploadedAt: new Date(),
        fileSize: file.size,
      };

      this.documents.push(document);
      await this.saveDocuments();

      return {
        status: 'ok',
        message: 'Document uploaded successfully',
        document: {
          id: document.id,
          title: document.title,
          description: document.description,
          filename: document.filename,
          uploadedAt: document.uploadedAt,
          fileSize: document.fileSize,
        },
      };
    } catch (error) {
      console.error('Document upload error:', error);
      return {
        status: 'error',
        message: 'Failed to upload document',
      };
    }
  }

  async deleteDocument(id: string) {
    const docIndex = this.documents.findIndex((d) => d.id === id);

    if (docIndex === -1) {
      return { status: 'error', message: 'Document not found' };
    }

    try {
      const doc = this.documents[docIndex];
      const filepath = path.join(this.uploadsDir, doc.filename);

      // Delete file
      await fs.unlink(filepath).catch(() => {});

      // Remove from list
      this.documents.splice(docIndex, 1);
      await this.saveDocuments();

      return {
        status: 'ok',
        message: 'Document deleted successfully',
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to delete document',
      };
    }
  }

  async getTrainingContext() {
    // Combine all document contents into a training context
    const context = this.documents
      .map((doc) => {
        return `## ${doc.title}\n${doc.description}\n\n${doc.content}\n\n`;
      })
      .join('\n---\n\n');

    return {
      status: 'ok',
      documents: this.documents.length,
      context: context || 'No training documents uploaded yet.',
    };
  }
}
