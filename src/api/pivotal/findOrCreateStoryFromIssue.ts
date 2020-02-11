import { api } from "./api";

import { WebhookPayloadIssuesIssue } from "@octokit/webhooks";
import { findOrCreateIntegration, PivotalStory } from "./";

export const findOrCreateStoryFromIssue = async (
  issue: WebhookPayloadIssuesIssue
): Promise<PivotalStory> => {
  // https://www.pivotaltracker.com/help/api/rest/v5#projects_project_id_stories_get
  const [story] = (await api(
    `stories?filter=external_id:${issue.number}`
  ).json()) as any[];

  if (story) {
    return story;
  }

  const integration = await findOrCreateIntegration();

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
};
