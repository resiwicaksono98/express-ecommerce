import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRequest } from "../type/userRequest";
import { prismaClient } from "../application/database";

export const authMiddleware = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer")) {
    const token = authHeader.split(" ")[1];
    try {
      const userDecoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as { id: string };
      const user = await prismaClient.user.findFirst({
        where: { id: userDecoded.id }
      });
      if (user?.token) {
        req.user = user!;
        next();
      } else {
        req.user = null!;
        res.status(401).json({ message: "Unauthorized" }).end();
      }
    } catch (err) {
      next(err);
    }
  } else {
    res.status(401).json({ message: "Unauthorized" }).end();
  }
};
