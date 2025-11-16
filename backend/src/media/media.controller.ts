import { Controller, Get, Post, Delete, Query, Param, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  async listMedia(@Query('category') category?: string, @Query('subcategory') subcategory?: string) {
    return this.mediaService.list(category, subcategory);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @UploadedFile() file: any,
    @Body() body: { name?: string; category?: string; subcategory?: string; description?: string },
  ) {
    const category = body.category || 'ivr';
    return this.mediaService.saveUploadedFile(file, body.name, category, body.subcategory, body.description);
  }

  @Delete(':id')
  async deleteMedia(@Param('id') id: string) {
    return this.mediaService.delete(id);
  }
}
