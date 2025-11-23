import { IsEmail, IsNotEmpty } from 'class-validator';

export class TestMailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
