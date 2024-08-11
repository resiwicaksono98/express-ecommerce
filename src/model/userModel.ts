import { User } from "@prisma/client";

export type UserResponse = {
  id: string;
  username: string;
  fullName: string;
  email: string;
};

export type CreateUserRequest = {
  email: string;
  username: string;
  password: string;
  fullName: string;
};

export type LoginUserRequest = {
    email: string;
    password: string;
}

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    username: user.username,
    fullName: user.full_name,
    email: user.email,

  };
}
