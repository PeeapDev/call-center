import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private openai: OpenAI | null = null;

  constructor(private configService: ConfigService) {
    this.initializeDeepSeek();
  }

  private initializeDeepSeek() {
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('DeepSeek API key not configured. Chatbot will use fallback responses.');
      return;
    }

    try {
      this.openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: apiKey,
      });
      this.logger.log('✓ DeepSeek AI initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize DeepSeek: ${error.message}`);
    }
  }

  async sendMessage(message: string): Promise<string> {
    // If DeepSeek is not configured, use fallback
    if (!this.openai) {
      return this.getFallbackResponse(message);
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant for the Ministry of Education of Sierra Leone. 
Your role is to help citizens report and get information about:
- Exam malpractice and cheating
- Teacher misconduct
- School facility issues
- Fee irregularities
- General education complaints

Be professional, empathetic, and provide clear guidance. Always emphasize confidentiality and encourage reporting.
Keep responses concise and actionable. If you don't have specific information, direct them to call the hotline: +232 76 000 000.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || this.getFallbackResponse(message);
    } catch (error) {
      this.logger.error(`DeepSeek API error: ${error.message}`);
      return this.getFallbackResponse(message);
    }
  }

  private getFallbackResponse(message: string): string {
    const input = message.toLowerCase();

    if (input.includes('exam') || input.includes('malpractice') || input.includes('cheating')) {
      return 'To report exam malpractice:\n\n1. Call our hotline: +232 76 000 000\n2. Provide exam details (date, school, exam type)\n3. Describe the malpractice incident\n4. You can remain anonymous\n\nWe take all reports seriously and will investigate promptly.';
    }

    if (input.includes('complaint') || input.includes('report')) {
      return 'You can file a complaint through:\n\n• Phone: +232 76 000 000 (Mon-Fri, 8AM-6PM)\n• Online: Use our complaint form\n• In-person: Visit your district education office\n\nPlease have details ready: school name, incident date, and description.';
    }

    if (input.includes('teacher') || input.includes('staff')) {
      return 'For teacher-related complaints:\n\n• Teacher misconduct\n• Unprofessional behavior\n• Attendance issues\n\nContact us with the teacher\'s name, school, and incident details. All complaints are confidential.';
    }

    if (input.includes('school') || input.includes('facility')) {
      return 'School facility concerns we handle:\n\n• Infrastructure problems\n• Safety hazards\n• Lack of resources\n• Sanitation issues\n\nProvide photos if possible when reporting.';
    }

    if (input.includes('fee') || input.includes('payment') || input.includes('money')) {
      return 'For fee-related issues:\n\n• Unauthorized fee collection\n• Receipt not provided\n• Excessive charges\n\nReport with school name, amount, and date. Keep any receipts or evidence.';
    }

    return 'I understand you need help. For specific assistance:\n\n📞 Call: +232 76 000 000\n✉️ Email: complaints@education.gov.sl\n\nOr ask me about exam malpractice, complaints, school issues, or fees.';
  }

  // Update API key dynamically
  updateApiKey(apiKey: string) {
    if (!apiKey) {
      this.openai = null;
      this.logger.warn('DeepSeek API key removed. Using fallback responses.');
      return;
    }

    try {
      this.openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: apiKey,
      });
      this.logger.log('✓ DeepSeek API key updated successfully');
    } catch (error) {
      this.logger.error(`Failed to update DeepSeek API key: ${error.message}`);
      throw error;
    }
  }

  isConfigured(): boolean {
    return this.openai !== null;
  }
}
