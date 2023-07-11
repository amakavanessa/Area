import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
  signup() {
    return { msg: 'Hello, i ve signed up' };
  }

  signin() {
    return { msg: 'Hello, i ve signed in' };
  }
}
