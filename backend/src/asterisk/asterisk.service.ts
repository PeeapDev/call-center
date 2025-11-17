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
    // Asterisk connection - configure when ready
    this.logger.log('Asterisk service initialized - attempting ARI connection...');
    // Enable Asterisk connection
    this.connectARI().catch((err) => {
      this.logger.error(`Asterisk connection failed during init: ${err.message}`);
    });
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

      // Start the Stasis application so Asterisk can route calls to it
      this.ariClient.start('callcenter');
      this.logger.log('✓ Started Stasis application: callcenter');

      // Subscribe to all events for debugging
      this.ariClient.on('StasisStart', (event: any, channel: any) => {
        this.logger.log(`📞 StasisStart: ${channel.name} entered callcenter app`);
      });

      this.ariClient.on('StasisEnd', (event: any, channel: any) => {
        this.logger.log(`📴 StasisEnd: ${channel.name} left callcenter app`);
      });

      this.ariClient.on('ChannelDtmfReceived', (event: any, channel: any) => {
        this.logger.log(`🔢 DTMF received: ${event.digit} on channel ${channel.name}`);
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
