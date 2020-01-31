import express from "express";

import { middleware as github } from "./github";
import { middleware as pivotal } from "./pivotal";

export const api = express()
  .use("/github", github)
  .use("/pivotal", pivotal);
