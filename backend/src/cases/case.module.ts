import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaseController } from './case.controller';
import { CaseService } from './case.service';
import { Case } from './case.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Case])],
  controllers: [CaseController],
  providers: [CaseService],
  exports: [CaseService],
})
export class CaseModule {}
