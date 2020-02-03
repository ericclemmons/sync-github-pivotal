import { api } from "./api";

export const findOrCreateIntegration = async () => {
  // https://www.pivotaltracker.com/help/api/rest/v5#projects_project_id_integrations_get
  const integrations = (await api("integrations").json()) as any[];

  // https://www.pivotaltracker.com/help/api/rest/v5#projects_project_id_integrations_post
  const integration = integrations.find(
    integration => integration.name === process.env.PIVOTAL_INTEGRATION_NAME
  );

  if (integration) {
    return integration;
  }

  return api
    .post("integrations", {
      json: {
        active: true,
        base_url: process.env.GITHUB_ISSUES_URL,
        name: process.env.PIVOTAL_INTEGRATION_NAME,
        project_id: process.env.PIVOTAL_PROJECT_ID,
        type: "other"
      }
    })
    .json();
};
