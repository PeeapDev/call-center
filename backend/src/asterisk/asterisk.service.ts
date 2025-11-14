import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ari from 'ari-client';

@Injectable()
export class AsteriskService implements OnModuleInit {
  private readonly logger = new Logger(AsteriskService.name);
  private ariClient: any;
  private connected = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // Temporarily disabled - Asterisk auth issue, will fix later
    this.logger.warn('Asterisk connection disabled temporarily - will use mock data');
    // this.connectARI().catch((err) => {
    //   this.logger.error(`Asterisk connection failed during init: ${err.message}`);
    // });
  }

  private async connectARI() {
    try {
      const ariUrl = this.configService.get<string>('ASTERISK_ARI_URL');
      const ariUser = this.configService.get<string>('ASTERISK_ARI_USER');
      const ariPassword = this.configService.get<string>('ASTERISK_ARI_PASSWORD');

      if (!ariUrl || !ariUser || !ariPassword) {
        this.logger.warn('Asterisk ARI credentials not configured - skipping connection');
        return;
      }

      // Parse URL to get host and port
      const url = new URL(ariUrl);
      const host = url.hostname;
      const port = url.port || '8088';

      this.logger.log(`Attempting to connect to Asterisk ARI at ${host}:${port}...`);

      // Set a timeout to prevent hanging
      const connectPromise = ari.connect(
        `http://${host}:${port}`,
        ariUser,
        ariPassword,
      );

      this.ariClient = await Promise.race([
        connectPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout after 10s')), 10000),
        ),
      ]);

      this.connected = true;
      this.logger.log('✓ Connected to Asterisk ARI successfully');

      // Subscribe to all events for debugging
      this.ariClient.on('StasisStart', (event: any, channel: any) => {
        this.logger.debug(`StasisStart: ${channel.name}`);
      });
    } catch (error: any) {
      this.logger.warn(
        `Could not connect to Asterisk ARI: ${error.message}. Backend will run without Asterisk integration.`,
      );
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getAsteriskInfo() {
    if (!this.ariClient) {
      throw new Error('ARI client not initialized');
    }

    try {
      const info = await this.ariClient.asterisk.getInfo();
      return info;
    } catch (error) {
      this.logger.error(`Failed to get Asterisk info: ${error.message}`);
      throw error;
    }
  }

  async getChannels() {
    if (!this.ariClient) {
      throw new Error('ARI client not initialized');
    }

    try {
      const channels = await this.ariClient.channels.list();
      return channels;
    } catch (error) {
      this.logger.error(`Failed to get channels: ${error.message}`);
      throw error;
    }
  }

  getClient() {
    return this.ariClient;
  }
}
