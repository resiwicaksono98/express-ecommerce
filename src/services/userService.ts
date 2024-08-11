import { NextFunction, Request } from "express";
import { prismaClient } from "../application/database";
import { ResponseError } from "../error/responseError";
import {
  CreateUserRequest,
  LoginUserRequest,
  toUserResponse,
  UserResponse
} from "../model/userModel";
import { UserValidation } from "../validation/userValidation";
import { Validation } from "../validation/validation";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { UserRequest } from "../type/userRequest";
import { logger } from "../application/logging";

export class UserService {
  static async register(request: CreateUserRequest): Promise<UserResponse> {
    const registerRequest = Validation.validate(
      UserValidation.REGISTER,
      request
    );

    await this.checkEmailExists(registerRequest.email);
    await this.checkUsernameExists(registerRequest.username);

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const user = await prismaClient.user.create({
      data: {
        email: registerRequest.email,
        username: registerRequest.username,
        full_name: registerRequest.fullName,
        password: registerRequest.password
      }
    });

    return toUserResponse(user);
  }

  static async checkUsernameExists(username: string) {
    const checkUsername = await prismaClient.user.count({
      where: {
        username
      }
    });

    if (checkUsername > 0) {
      throw new ResponseError(400, "Username already exists");
    }

    return checkUsername;
  }

  static async checkEmailExists(email: string) {
    const checkEmail = await prismaClient.user.count({
      where: {
        email
      }
    });

    if (checkEmail > 0) {
      throw new ResponseError(400, "Username already exists");
    }

    return checkEmail;
  }

  static async login(request: LoginUserRequest): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const loginRequest = Validation.validate(UserValidation.LOGIN, request);

    const user = await prismaClient.user.findUnique({
      where: {
        email: loginRequest.email
      }
    });
    if (!user) {
      throw new ResponseError(400, "Invalid credentials");
    }
    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new ResponseError(400, "Invalid credentials");
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.full_name
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "60s"
      }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.full_name
      },
      process.env.JWT_REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "1d"
      }
    );

    await prismaClient.user.update({
      where: {
        id: user.id
      },
      data: {
        token: refreshToken
      }
    });

    return {
      accessToken,
      refreshToken
    };
  }

  static async getMe(user: User): Promise<UserResponse> {

    return toUserResponse(user!);
  }

  static async refreshToken(request: UserRequest): Promise<{
    accessToken: string;
  }> {
    const { refreshToken } = request.cookies;
    if(!refreshToken ){
        throw new ResponseError(401, "Invalid Refresh Token")
    }
    const user = await prismaClient.user.findFirst({
      where: {
        token: refreshToken
      }
    });

    if (!user) {
      throw new ResponseError(401, "Invalid refresh token");
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.full_name
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "60s"
      }
    );

    return {
      accessToken
    };
  }

  static async logout(user: User) : Promise<UserResponse> {
    const result = await prismaClient.user.update({
      where: {
        id: user.id
      },
      data: {
        token: null
      }
    });

    return toUserResponse(result);
  }
}
