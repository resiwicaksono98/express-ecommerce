import express from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { UserController } from '../controllers/userController';

export const  apiRouter = express.Router()
apiRouter.use(authMiddleware);

// User API
apiRouter.get("/api/users/me", UserController.getMe)
apiRouter.delete("/api/users/logout", UserController.logout)
