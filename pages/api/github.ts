import "dotenv-safe/config";
import { createHmac } from "crypto";
import got, { ResponseObject } from "got";
import { NextApiRequest, NextApiResponse } from "next";
import getRawBody from "raw-body";

const pivotal = got.extend({
  headers: {
    "X-TrackerToken": process.env.PIVOTAL_TRACKER_TOKEN
  },
  prefixUrl: "https://www.pivotaltracker.com/services/v5"
});

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
  let response: ResponseObject = undefined;

  // ? Should `X-GitHub-Event` (e.g. `issues`) be used here as well?
  switch (body.action) {
    case "opened":
      const { issue } = body;

      // https://www.pivotaltracker.com/help/api/rest/v5#projects_project_id_stories_get
      const existing = (await pivotal(
        `projects/${process.env.PIVOTAL_PROJECT_ID}/stories?filter=external_id:${issue.number}`
      ).json()) as any[];

      if (existing.length) {
        return res
          .status(409)
          .send(
            `GitHub issue #${issue.number} has ${existing.length} existing stories`
          );
      }

      // https://www.pivotaltracker.com/help/api/rest/v5#projects_project_id_stories_post
      response = await pivotal
        .post(`projects/${process.env.PIVOTAL_PROJECT_ID}/stories`, {
          json: {
            // external_id: "issue.number",
            created_at: issue.created_at,
            description: issue.body,
            name: issue.title
          }
        })
        .json();

      break;

    default:
      return res
        .status(501)
        .json({ message: `${JSON.stringify(body.action)} is not implemented` });
  }

  res.status(200).json(response ?? { message: "Success" });
};

export default (req: NextApiRequest, res: NextApiResponse) => {
  handle(req, res).catch(error => {
    console.error(error.response);
    res
      .status(error.response?.statusCode ?? 500)
      .json(error.response?.body ?? { message: error.message });
  });
};

export const config = {
  api: {
    bodyParser: false
  }
};
