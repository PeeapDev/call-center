import { IsString, IsOptional, IsDateString, IsInt } from 'class-validator';

export class CreateCaseDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  reportedBy?: string;

  @IsOptional()
  @IsString()
  callerPhone?: string;

  @IsOptional()
  @IsString()
  callerEmail?: string;

  @IsOptional()
  @IsString()
  callId?: string;

  @IsOptional()
  @IsString()
  callRecordingUrl?: string;

  @IsOptional()
  @IsInt()
  callDuration?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  customFields?: any;

  @IsOptional()
  attachments?: string[];
}
