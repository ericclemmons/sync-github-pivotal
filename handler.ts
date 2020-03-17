import express from "express";
import serverless from "serverless-http";

import { api } from "./src/api";

export const handler = serverless(api);
