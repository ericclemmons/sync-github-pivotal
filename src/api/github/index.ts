import bodyParser from "body-parser";
import express from "express";

import { handler } from "./handler";
import { verifySignature } from "./verifySignature";
import { verifyMethod } from "./verifyMethod";

declare module "http" {
  interface IncomingMessage {
    rawBody: Buffer;
  }
}

export const middleware = express()
  .use(
    bodyParser.json({
      verify: (req, res, buffer) => (req.rawBody = buffer)
    })
  )
  .use(verifyMethod)
  .use(verifySignature)
  .use((req, res, next) =>
    handler(req, res)
      .then(result => {
        console.info(result);
        res.json(result);
      })
      .catch(error => next(error))
  );
