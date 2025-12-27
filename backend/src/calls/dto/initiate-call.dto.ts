import { IsString, IsOptional, IsNotEmpty, Matches, IsIn } from 'class-validator';

export class InitiateCallDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9\s\-()]+$/, { message: 'Phone number must be valid' })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['1', '2', '3', '4', '9'], { message: 'IVR option must be 1, 2, 3, 4, or 9' })
  ivrOption: string;

  @IsString()
  @IsOptional()
  callerName?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  queueName?: string;
}

export class CallResponseDto {
  success?: boolean;
  callId?: string;
  status?: string;
  assignedAgent?: {
    id: string;
    name: string;
    extension: string;
  };
  queuePosition?: number;
  estimatedWait?: number;
  message: string;
}

export class CallStatusDto {
  callId: string;
  status: string;
  duration?: number;
  agent?: {
    id: string;
    name: string;
    extension: string;
  };
  assignedAgentName?: string;
  queuePosition?: number;
  createdAt: Date;
  endedAt?: Date;
}
