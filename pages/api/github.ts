import "dotenv-safe/config";
import { createHmac } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";
import getRawBody from "raw-body";

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(400).json({ message: "Unsupported HTTP method" });
  }

  const signature = req.headers["x-hub-signature"];

  if (!signature) {
    return res.status(401).json({ message: "Missing x-hub-signature" });
  }

  const rawBody = await getRawBody(req);
  const expectedSignature =
    "sha1=" +
    createHmac("sha1", process.env.GITHUB_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(401).json({ message: "Invalid x-hub-signature" });
  }

  const body = JSON.parse(rawBody.toString("utf8"));

  // Echo out body until hooks are integrated
  res.status(200).json(body);
};

export default (req: NextApiRequest, res: NextApiResponse) => {
  handle(req, res).catch(error => {
    console.error(error);
    res.status(500).json({ message: error.message });
  });
};

export const config = {
  api: {
    bodyParser: false
  }
};
