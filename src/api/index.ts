import { isBoom, boomify, Boom } from "@hapi/boom";
import express, { NextFunction, Request, Response } from "express";

import { middleware as github } from "./github";
import { middleware as pivotal } from "./pivotal";

export const api = express()
  .use("/github", github)
  .use("/pivotal", pivotal)
  .use(
    (error: Boom | Error, req: Request, res: Response, next: NextFunction) => {
      let data;

      try {
        // @ts-ignore
        // https://github.com/sindresorhus/got#usage
        data = error.response?.body ?? "null";
        data = JSON.parse(data);
      } catch (error) {}

      const boom = isBoom(error) ? (error as Boom) : boomify(error, { data });

      if (boom.isServer) {
        console.error(boom);
      }

      return res.status(boom.output.statusCode).json(boom.output.payload);
    }
  );
