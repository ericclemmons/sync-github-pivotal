import { WebhookPayloadIssuesIssue } from "@octokit/webhooks";

import { api, PivotalStory } from ".";

export const updateStoryFromIssue = async (
  story: PivotalStory,
  issue: WebhookPayloadIssuesIssue
) => {
  const labels = issue.labels.map(label => label.name);
  const story_type = labels.includes("bug") ? "bug" : "feature";

  // https://www.pivotaltracker.com/help/api/rest/v5#projects_project_id_stories_story_id_put
  return await api
    .put(`stories/${story.id}`, {
      json: { labels, story_type }
    })
    .json();
};
