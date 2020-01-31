import "dotenv-safe/config";
import { isBoom, boomify, Boom } from "@hapi/boom";
import express, { NextFunction, Request, Response } from "express";
import { api } from "./api";

const { PORT = 3000 } = process.env;

export const server = express()
  .use("/api", api)
  .use(
    (error: Boom | Error, req: Request, res: Response, next: NextFunction) => {
      const boom = isBoom(error) ? (error as Boom) : boomify(error);

      if (boom.isServer) {
        console.error(boom);
      }

      return res.status(boom.output.statusCode).json(boom.output.payload);
    }
  )
  .listen(PORT, () => {
    console.info(`🚀  Listening on http://localhost:${PORT}`);
  });
