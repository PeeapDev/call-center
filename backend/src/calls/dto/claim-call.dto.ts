import { IsNotEmpty, IsString } from 'class-validator';

export class ClaimCallDto {
  @IsNotEmpty()
  @IsString()
  agentName: string;

  @IsNotEmpty()
  @IsString()
  agentExtension: string;
}
