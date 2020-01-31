import "dotenv-safe/config";
import { createHmac } from "crypto";
import { ResponseObject } from "got";
import { NextApiRequest, NextApiResponse } from "next";
import getRawBody from "raw-body";
import { createIntegration } from "../../utils/createIntegration";
import { pivotal } from "../../utils/pivotal";
import { findIntegration } from "../../utils/findIntegration";
import { findStoryByIssueNumber } from "../../utils/findStoryByIssueNumber";

const { GITHUB_WEBHOOK_SECRET, PIVOTAL_PROJECT_ID } = process.env;

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
    createHmac("sha1", GITHUB_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(401).json({ message: "Invalid x-hub-signature" });
  }

  const body = JSON.parse(rawBody.toString("utf8"));
  const eventAction = `${req.headers["x-github-event"]}.${body.action}`;
  let response: ResponseObject = undefined;

  // https://developer.github.com/v3/activity/events/types/#issuesevent
  if (eventAction === "issues.edited") {
    // https://www.pivotaltracker.com/help/api/rest/v5#story_resource
    const story = await findStoryByIssueNumber(body.issue.number);

    // https://www.pivotaltracker.com/help/api/rest/v5#projects_project_id_stories_story_id_put
    response = await pivotal
      .put(`projects/${PIVOTAL_PROJECT_ID}/stories/${story.id}`, {
        json: {
          // project_id: PIVOTAL_PROJECT_ID,
          // story_id: story.id,
          // Update title if issue.title changed
          name: body.changes.title ? body.issue.title : story.name,
          // Update description if issue.body changed
          description: body.changes.body ? body.issue.body : story.description
        }
      })
      .json();
  }

  // https://developer.github.com/v3/activity/events/types/#issuesevent
  else if (eventAction === "issues.opened") {
    const story = await findStoryByIssueNumber(body.issue.number);
    const { issue } = body;

    if (story) {
      return res
        .status(409)
        .send(
          `GitHub issue #${issue.number} has an existin story: ${story.url}`
        );
    }

    const integration =
      (await findIntegration()) ?? (await createIntegration());

    // https://www.pivotaltracker.com/help/api/rest/v5#projects_project_id_stories_post
    response = await pivotal
      .post(`projects/${PIVOTAL_PROJECT_ID}/stories`, {
        json: {
          created_at: issue.created_at,
          description: issue.body,
          external_id: JSON.stringify(issue.number),
          integration_id: integration.id,
          name: issue.title
        }
      })
      .json();
  } else {
    return res
      .status(501)
      .json({ message: `${eventAction} is not implemented` });
  }

  res.status(200).json(response ?? { message: "Success" });
};

export default (req: NextApiRequest, res: NextApiResponse) => {
  // TODO Use Boom (https://hapi.dev/family/boom/api) for abstracting errors & response codes out
  handle(req, res).catch(error => {
    console.error(error.response);
    res.status(error.response?.statusCode ?? 500).json(
      error.response?.body ?? {
        message: error.message
      }
    );
  });
};

export const config = {
  api: {
    bodyParser: false
  }
};
