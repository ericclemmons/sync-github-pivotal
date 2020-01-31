import { conflict, notImplemented } from "@hapi/boom";
import { WebhookPayloadIssues } from "@octokit/webhooks";
import { Request, Response } from "express";

import {
  api,
  createIntegration,
  findIntegration,
  findStoryByIssueNumber
} from "../pivotal";

export const handler = async (req: Request, res: Response) => {
  const event = req.headers["x-github-event"];
  const payload = req.body as WebhookPayloadIssues;
  const { action } = payload;

  // https://developer.github.com/v3/activity/events/types/#issuesevent
  if (event === "issues") {
    if (action === "edited") {
      const { issue } = payload;

      // https://www.pivotaltracker.com/help/api/rest/v5#story_resource
      const story = await findStoryByIssueNumber(issue.number);

      // https://www.pivotaltracker.com/help/api/rest/v5#projects_project_id_stories_story_id_put
      return await api
        .put(`projects/${process.env.PIVOTAL_PROJECT_ID}/stories/${story.id}`, {
          json: {
            // Update title if issue.title changed
            // @ts-ignore because definition doesn't have title
            name: payload.changes.title ? payload.issue.title : story.name,
            // Update description if issue.body changed
            // @ts-ignore because definition doesn't have body
            description: payload.changes.body
              ? payload.issue.body
              : story.description
          }
        })
        .json();
    }

    if (action === "opened") {
      const { issue } = payload;
      const story = await findStoryByIssueNumber(issue.number);

      if (story) {
        throw conflict(
          `GitHub issue #${issue.number} has an existin story: ${story.url}`
        );
      }

      const integration =
        (await findIntegration()) ?? (await createIntegration());
      // https://www.pivotaltracker.com/help/api/rest/v5#projects_project_id_stories_post

      return await api
        .post(`projects/${process.env.PIVOTAL_PROJECT_ID}/stories`, {
          json: {
            created_at: issue.created_at,
            description: issue.body,
            external_id: JSON.stringify(issue.number),
            integration_id: integration.id,
            name: issue.title
          }
        })
        .json();
    }
  }

  throw notImplemented(`${event}.${action} is not implemented`);
};
