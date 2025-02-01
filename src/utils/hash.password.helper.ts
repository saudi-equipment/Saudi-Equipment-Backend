import { ForbiddenException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

export const validatePassword = (password: string, confirmedPassword: string) => {
    if (password !== confirmedPassword) {
      throw new ForbiddenException('Passwords do not match');
    }
  }

export const hashPassword = (password: string) => {
    return bcrypt.hash(password, 10);
}