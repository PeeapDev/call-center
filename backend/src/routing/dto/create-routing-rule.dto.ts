import { IsString, IsInt, IsArray, IsBoolean, IsEnum, IsOptional, Min, Max } from 'class-validator';

export class CreateRoutingRuleDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  @Max(100)
  priority: number;

  @IsArray()
  @IsString({ each: true })
  conditions: string[];

  @IsString()
  destination: string;

  @IsEnum(['queue', 'agent', 'ivr', 'voicemail', 'external'])
  destinationType: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsString()
  @IsOptional()
  asteriskContext?: string;

  @IsString()
  @IsOptional()
  asteriskExtension?: string;
}
