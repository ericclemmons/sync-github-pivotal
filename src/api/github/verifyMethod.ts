import { methodNotAllowed } from "@hapi/boom";
import { NextFunction, Request, Response } from "express";

export const verifyMethod = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.method === "POST") {
    return next();
  }

  throw methodNotAllowed("POST required");
};
