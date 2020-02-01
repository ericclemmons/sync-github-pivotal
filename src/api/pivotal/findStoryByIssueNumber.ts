import { api } from "./api";

export const findStoryByIssueNumber = async (issueNumber: number) => {
  // https://www.pivotaltracker.com/help/api/rest/v5#projects_project_id_stories_get
  const stories = (await api(
    `stories?filter=external_id:${issueNumber}`
  ).json()) as any[];

  return stories[0];
};
