import { conflict, notImplemented } from "@hapi/boom";
import {
  WebhookPayloadIssues,
  WebhookPayloadMilestone,
  WebhookPayloadIssuesIssue
} from "@octokit/webhooks";
import { Request, Response } from "express";

import {
  api,
  createIntegration,
  findIntegration,
  findStoryByIssueNumber
} from "../pivotal";

export const handler = async (req: Request, res: Response) => {
  const event = req.headers["x-github-event"];
  const payload = req.body as WebhookPayloadIssues | WebhookPayloadMilestone;
  const { action } = payload;

  // https://developer.github.com/v3/activity/events/types/#issuesevent
  if (event === "issues") {
    const { issue } = payload as WebhookPayloadIssues;
    // https://www.pivotaltracker.com/help/api/rest/v5#story_resource
    const story = await findStoryByIssueNumber(issue.number);

    if (action === "edited") {
      // https://www.pivotaltracker.com/help/api/rest/v5#projects_project_id_stories_story_id_put
      return await api
        .put(`stories/${story.id}`, {
          json: {
            // Update title if issue.title changed
            // @ts-ignore because definition doesn't have title
            name: payload.changes.title ? issue.title : story.name,
            // Update description if issue.body changed
            // @ts-ignore because definition doesn't have body
            description: payload.changes.body ? issue.body : story.description
          }
        })
        .json();
    }

    if (action === "labeled" || action === "unlabeled") {
      const labels = issue.labels.map(label => label.name);

      return await api
        .put(`stories/${story.id}`, {
          json: {
            labels
          }
        })
        .json();
    }

    if (action === "opened") {
      if (story) {
        throw conflict(
          `GitHub issue #${issue.number} has an existin story: ${story.url}`
        );
      }

      const integration =
        (await findIntegration()) ?? (await createIntegration());
      // https://www.pivotaltracker.com/help/api/rest/v5#projects_project_id_stories_post

      return await api
        .post("stories", {
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

  if (event === "milestone") {
    const { milestone } = payload as WebhookPayloadMilestone;

    if (action === "created") {
      // https://www.pivotaltracker.com/help/api/rest/v5#projects_project_id_epics_post
      return api
        .post("epics", {
          json: {
            name: milestone.title,
            label: { name: milestone.title },
            description: milestone.description
          }
        })
        .json();
    }
  }

  throw notImplemented(`${event}.${action} is not implemented`);
};
