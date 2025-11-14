import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AsteriskModule } from './asterisk/asterisk.module';
import { ChatModule } from './chat/chat.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { RoutingModule } from './routing/routing.module';
import { StaffModule } from './staff/staff.module';
import { CaseModule } from './cases/case.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'callcenter.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Set to false in production
    }),
    AsteriskModule,
    ChatModule,
    ApiKeysModule,
    RoutingModule,
    StaffModule,
    CaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}