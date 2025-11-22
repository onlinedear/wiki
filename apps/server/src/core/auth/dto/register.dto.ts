import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class RegisterDto {
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(70)
  @IsString()
  password: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(70)
  @IsString()
  confirmPassword: string;
}
