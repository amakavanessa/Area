export class UserDto {
  email: string;
  username: string;
  type: string;
  profilePicture: string | null;
  createdAt: Date;
}

export class UserUpdateDto {
  username?: string;
  email?: string;
  profilePicture?: string;
  updatedAt: Date;
}
