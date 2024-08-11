import { LoginUserRequest } from "./../model/userModel";
import { Request, Response, NextFunction } from "express";
import { CreateUserRequest } from "../model/userModel";
import { UserService } from "../services/userService";
import { UserRequest } from "../type/userRequest";

export class UserController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const request: CreateUserRequest = req.body as CreateUserRequest;
      const user = await UserService.register(request);

      res.status(200).json({
        message: "User registered successfully",
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const request: LoginUserRequest = req.body as LoginUserRequest;
      const { accessToken, refreshToken } = await UserService.login(request);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: "strict",
        secure: process.env.APP_ENV === "production"
      });

      res.status(200).json({
        message: "User logged in successfully",
        data: {
          accessToken
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async getMe(req: UserRequest, res: Response, next: NextFunction) {
    try {

      const user = await UserService.getMe(req.user!);

      res.status(200).json({
        message: "User profile retrieved successfully",
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken } = await UserService.refreshToken(req);

      res.status(200).json({
        message: "Token refreshed successfully",
        data: {
          accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: UserRequest, res: Response, next: NextFunction) {
    try {
      await UserService.logout(req.user!);
      res.clearCookie("refreshToken");
      req.user = null!;

      res.status(200).json({
        message: "User logged out successfully"
      });
    } catch (error) {
      next(error);
    }
  }
}
