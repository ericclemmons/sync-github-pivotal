import { unauthorized } from "@hapi/boom";
import { createHmac } from "crypto";
import { NextFunction, Request, Response } from "express";

export const verifySignature = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const signature = req.headers["x-hub-signature"];

  if (!signature) {
    throw unauthorized("Missing x-hub-signature");
  }

  const expectedSignature =
    "sha1=" +
    createHmac("sha1", process.env.GITHUB_WEBHOOK_SECRET as string)
      .update(req.rawBody)
      .digest("hex");

  if (signature !== expectedSignature) {
    throw unauthorized("Invalid x-hub-signature");
  }

  next();
};
