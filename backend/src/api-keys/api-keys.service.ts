import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

interface ApiKey {
  name: string;
  key: string;
  description: string;
  masked: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);
  private readonly envFilePath: string;

  constructor(private configService: ConfigService) {
    // Path to .env file
    this.envFilePath = path.join(process.cwd(), '.env');
  }

  async getAllApiKeys() {
    const keys = [
      {
        name: 'DEEPSEEK_API_KEY',
        description: 'DeepSeek AI API key for chatbot',
        value: this.configService.get<string>('DEEPSEEK_API_KEY') || '',
      },
      {
        name: 'ASTERISK_ARI_URL',
        description: 'Asterisk REST Interface URL',
        value: this.configService.get<string>('ASTERISK_ARI_URL') || '',
      },
      {
        name: 'ASTERISK_ARI_USER',
        description: 'Asterisk ARI username',
        value: this.configService.get<string>('ASTERISK_ARI_USER') || '',
      },
      {
        name: 'ASTERISK_ARI_PASSWORD',
        description: 'Asterisk ARI password',
        value: this.configService.get<string>('ASTERISK_ARI_PASSWORD') || '',
      },
    ];

    return keys.map((key) => ({
      name: key.name,
      description: key.description,
      masked: this.maskApiKey(key.value),
      isConfigured: !!key.value,
    }));
  }

  async updateApiKey(name: string, value: string) {
    try {
      // Read current .env file
      let envContent = '';
      if (fs.existsSync(this.envFilePath)) {
        envContent = fs.readFileSync(this.envFilePath, 'utf-8');
      }

      // Update or add the key
      const keyPattern = new RegExp(`^${name}=.*$`, 'm');
      if (keyPattern.test(envContent)) {
        // Update existing key
        envContent = envContent.replace(keyPattern, `${name}=${value}`);
      } else {
        // Add new key
        envContent += `\n${name}=${value}`;
      }

      // Write back to .env file
      fs.writeFileSync(this.envFilePath, envContent);

      // Update process.env (for current session)
      process.env[name] = value;

      this.logger.log(`✓ API key ${name} updated successfully`);

      return {
        status: 'ok',
        message: 'API key updated successfully',
        masked: this.maskApiKey(value),
      };
    } catch (error) {
      this.logger.error(`Failed to update API key ${name}: ${error.message}`);
      throw new Error('Failed to update API key');
    }
  }

  async deleteApiKey(name: string) {
    try {
      // Read current .env file
      if (!fs.existsSync(this.envFilePath)) {
        throw new Error('.env file not found');
      }

      let envContent = fs.readFileSync(this.envFilePath, 'utf-8');

      // Remove the key
      const keyPattern = new RegExp(`^${name}=.*$\\n?`, 'm');
      envContent = envContent.replace(keyPattern, '');

      // Write back to .env file
      fs.writeFileSync(this.envFilePath, envContent);

      // Remove from process.env
      delete process.env[name];

      this.logger.log(`✓ API key ${name} deleted successfully`);

      return {
        status: 'ok',
        message: 'API key deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to delete API key ${name}: ${error.message}`);
      throw new Error('Failed to delete API key');
    }
  }

  private maskApiKey(key: string): string {
    if (!key || key.length < 8) {
      return '••••••••';
    }
    const visibleChars = 4;
    const start = key.substring(0, visibleChars);
    const end = key.substring(key.length - visibleChars);
    return `${start}${'•'.repeat(Math.max(8, key.length - visibleChars * 2))}${end}`;
  }
}
