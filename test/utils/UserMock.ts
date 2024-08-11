import { User } from "@prisma/client";
import { prismaClient } from "../../src/application/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Cookies from 'js-cookie';
import { logger } from "../../src/application/logging";
import dotenv from 'dotenv'

dotenv.config()

export class UserMock {
  static async delete() {
    await prismaClient.user.deleteMany({
      where: {
        username: "test"
      }
    });
  }

  static async create() {
     await prismaClient.user.create({
      data: {
        username: "test",
        full_name: "Test User",
        email: "test@example.com",
        password: await bcrypt.hash("test123", 10)
      }
    });
  }

  static async login() {
    const user = await prismaClient.user.findFirst({
      where: {
        username: "test"
      }
    });
    if (!user) {
        throw new Error("User not found");
    }
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_TOKEN_SECRET as string
      ,
      {
        expiresIn: "1d"
    });
    await prismaClient.user.update({
        where: {
            id: user.id
        },
        data: {
            token: refreshToken
        }
    })
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
        expiresIn: "15m"
    });
    Cookies.set("refreshToken", refreshToken, {
        expires: 60,
    });
    return { accessToken, refreshToken };
  }

  static async getCookieAuth() {
    const accessToken = await this.login();
    return accessToken;
  }
}
