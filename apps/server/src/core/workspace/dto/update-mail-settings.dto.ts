import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMailSettingsDto {
  @IsOptional()
  @IsString()
  smtpHost?: string;

  @IsOptional()
  @IsNumber()
  smtpPort?: number;

  @IsOptional()
  @IsBoolean()
  smtpSecure?: boolean;

  @IsOptional()
  @IsString()
  smtpUsername?: string;

  @IsOptional()
  @IsString()
  smtpPassword?: string;

  @IsOptional()
  @IsEmail()
  mailFromAddress?: string;

  @IsOptional()
  @IsString()
  mailFromName?: string;

  @IsOptional()
  @IsBoolean()
  smtpIgnoreTLS?: boolean;
}
