import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface MediaItem {
  id: string;
  name: string;
  category: string;
  subcategory?: string; // For IVR areas like 'welcome', 'menu', 'exam', etc.
  description?: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

@Injectable()
export class MediaService {
  private readonly mediaDir = path.join(process.cwd(), 'uploads', 'media');
  private readonly metadataPath = path.join(this.mediaDir, 'metadata.json');
  private mediaItems: MediaItem[] = [];

  constructor() {
    this.init();
  }

  private async init() {
    try {
      await fs.mkdir(this.mediaDir, { recursive: true });
      const raw = await fs.readFile(this.metadataPath, 'utf-8');
      this.mediaItems = JSON.parse(raw);
    } catch {
      this.mediaItems = [];
    }
  }

  private async saveMetadata() {
    try {
      await fs.mkdir(this.mediaDir, { recursive: true });
      await fs.writeFile(this.metadataPath, JSON.stringify(this.mediaItems, null, 2));
    } catch (error) {
      console.error('Failed to save media metadata:', error);
    }
  }

  async list(category?: string, subcategory?: string) {
    let media = this.mediaItems;

    if (category) {
      media = media.filter((item) => item.category === category);
    }

    if (subcategory) {
      media = media.filter((item) => item.subcategory === subcategory);
    }

    return {
      status: 'ok',
      media,
    };
  }

  async saveUploadedFile(
    file: any,
    name?: string,
    category: string = 'ivr',
    subcategory?: string,
    description?: string,
  ) {
    if (!file) {
      return { status: 'error', message: 'No file provided' };
    }

    try {
      await fs.mkdir(this.mediaDir, { recursive: true });

      const id = `media_${Date.now()}`;
      const safeOriginal = (file.originalname || 'audio').replace(/[^a-zA-Z0-9_.-]/g, '_');
      const filename = `${id}_${safeOriginal}`;
      const filepath = path.join(this.mediaDir, filename);

      await fs.writeFile(filepath, file.buffer);

      const item: MediaItem = {
        id,
        name: name || file.originalname || 'Audio File',
        category,
        subcategory,
        description,
        filename,
        mimeType: file.mimetype || 'application/octet-stream',
        size: file.size || 0,
        uploadedAt: new Date().toISOString(),
      };

      this.mediaItems.push(item);
      await this.saveMetadata();

      return {
        status: 'ok',
        media: item,
      };
    } catch (error) {
      console.error('Failed to save media file:', error);
      return {
        status: 'error',
        message: 'Failed to save media file',
      };
    }
  }

  async delete(id: string) {
    const index = this.mediaItems.findIndex((item) => item.id === id);
    if (index === -1) {
      return { status: 'error', message: 'Media not found' };
    }

    const item = this.mediaItems[index];
    const filepath = path.join(this.mediaDir, item.filename);

    try {
      await fs.unlink(filepath).catch(() => {});
      this.mediaItems.splice(index, 1);
      await this.saveMetadata();

      return {
        status: 'ok',
        message: 'Media deleted successfully',
      };
    } catch (error) {
      console.error('Failed to delete media file:', error);
      return {
        status: 'error',
        message: 'Failed to delete media file',
      };
    }
  }
}
