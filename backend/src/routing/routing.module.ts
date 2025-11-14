import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutingController } from './routing.controller';
import { RoutingService } from './routing.service';
import { RoutingRule } from './routing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoutingRule])],
  controllers: [RoutingController],
  providers: [RoutingService],
  exports: [RoutingService],
})
export class RoutingModule {}
