import { notImplemented } from "@hapi/boom";
import {
  WebhookPayloadIssues,
  WebhookPayloadMilestone,
  WebhookPayloadMilestoneMilestone
} from "@octokit/webhooks";
import { Request, Response } from "express";

import {
  api,
  findOrCreateEpicFromMilestone,
  findOrCreateStoryFromIssue,
  PivotalLabel,
  updateStoryFromIssue
} from "../pivotal";

export const handler = async (req: Request, res: Response) => {
  const event = req.headers["x-github-event"];
  const payload = req.body as WebhookPayloadIssues | WebhookPayloadMilestone;
  const { action } = payload;

  // https://developer.github.com/v3/activity/events/types/#issuesevent
  if (event === "issues") {
    const { issue } = payload as WebhookPayloadIssues;
    // https://www.pivotaltracker.com/help/api/rest/v5#story_resource
    const story = await findOrCreateStoryFromIssue(issue);

    if (action === "demilestoned") {
      // @ts-ignore Property 'milestone' does not exist on type 'WebhookPayloadIssues'
      const milestone = payload.milestone as WebhookPayloadMilestoneMilestone;
      const labels = story.labels.filter((label: PivotalLabel) => {
        return label.name !== milestone.title.toLowerCase();
      });

      return await api.put(`stories/${story.id}`, { json: { labels } }).json();
    }

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
      return await updateStoryFromIssue(story, issue);
    }

    if (action === "milestoned") {
      const { milestone } = issue;
      const epic = await findOrCreateEpicFromMilestone(milestone);
      const labels = story.labels
        .map((label: PivotalLabel) => label.name)
        .concat(epic.label.name);

      return await api.put(`stories/${story.id}`, { json: { labels } }).json();
    }

    if (action === "opened") {
      return story;
    }
  }

  if (event === "milestone") {
    const { milestone } = payload as WebhookPayloadMilestone;

    if (action === "created") {
      return findOrCreateEpicFromMilestone(milestone);
    }

    if (action === "edited") {
      const epic = await findOrCreateEpicFromMilestone(milestone);

      // https://www.pivotaltracker.com/help/api/rest/v5#projects_project_id_epics_epic_id_put
      return api
        .put(`epics/${epic.id}`, {
          json: {
            name: milestone.title,
            // label: { name: milestone.title },
            description: milestone.description
          }
        })
        .json();
    }
  }

  throw notImplemented(`${event}.${action} is not implemented`);
};
