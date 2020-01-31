import { pivotal } from "./pivotal";

export const findStoryByIssueNumber = async (issueNumber: number) => {
  // https://www.pivotaltracker.com/help/api/rest/v5#projects_project_id_stories_get
  const stories = (await pivotal(
    `projects/${process.env.PIVOTAL_PROJECT_ID}/stories?filter=external_id:${issueNumber}`
  ).json()) as any[];

  return stories[0];
};
