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

export class PasswordResetDto {
  @IsString()
  password: string;
  @IsString()
  passwordConfirm: string;
}

export class decodedToken {
  sub: number;
  email: string;
  type: string;
  iat: number;
  exp: number;
}
