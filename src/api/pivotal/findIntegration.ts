import { api } from "./api";

export const findIntegration = async () => {
  // https://www.pivotaltracker.com/help/api/rest/v5#projects_project_id_integrations_get
  const integrations = (await api(
    `projects/${process.env.PIVOTAL_PROJECT_ID}/integrations`
  ).json()) as any[];

  // https://www.pivotaltracker.com/help/api/rest/v5#projects_project_id_integrations_post
  return integrations.find(
    integration => integration.name === process.env.PIVOTAL_INTEGRATION_NAME
  );
};
