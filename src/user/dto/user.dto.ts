import {
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserDto {
  @IsEmail()
  email: string;
  username: string;
  type: string;
  profilePicture: string | null;
  createdAt: Date;
}

export class UserUpdateDto {
  @IsOptional()
  @IsString()
  username: string;
  @IsEmail()
  @IsOptional()
  email: string;
  @IsOptional()
  profilePicture?: string;
  updatedAt: Date;
}
