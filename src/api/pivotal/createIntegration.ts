import { api } from "./api";

export const createIntegration = () => {
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
