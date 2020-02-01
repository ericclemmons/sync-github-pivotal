import got from "got";

export const api = got.extend({
  headers: {
    "X-TrackerToken": process.env.PIVOTAL_TRACKER_TOKEN
  },
  prefixUrl: `https://www.pivotaltracker.com/services/v5/projects/${process.env.PIVOTAL_PROJECT_ID}`
});
