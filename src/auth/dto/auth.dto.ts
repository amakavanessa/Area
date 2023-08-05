import { Exclude } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Exclude()
  password: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  type: 'host' | 'user' | 'admin';

  constructor(partial: Partial<AuthDto>) {
    Object.assign(this, partial);
  }
}

export class AuthSigninDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
