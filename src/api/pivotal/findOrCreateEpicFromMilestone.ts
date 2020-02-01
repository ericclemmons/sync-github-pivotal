import {
  WebhookPayloadIssuesIssueMilestone,
  WebhookPayloadMilestoneMilestone
} from "@octokit/webhooks";

import { api } from ".";

export const findOrCreateEpicFromMilestone = async (
  milestone:
    | WebhookPayloadIssuesIssueMilestone
    | WebhookPayloadMilestoneMilestone
) => {
  const epics = (await api("epics").json()) as any[];
  const epic = epics.find(epic => epic.name === milestone.title);

  if (epic) {
    return epic;
  }

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
};
