import express from 'express'
import { UserController } from '../controllers/userController';

export const publicRouter = express.Router();

// Authentication
publicRouter.post("/api/users/register", UserController.register);
publicRouter.post("/api/users/login", UserController.login);
publicRouter.get("/api/users/refresh-token", UserController.refreshToken)
