export type PivotalStory = {
  kind: "story";
  id: number;
  project_id: number;
  name: string;
  description: string;
  story_type: "bug" | "chore" | "feature" | "release";
  current_state:
    | "unscheduled"
    | "planned"
    | "unstarted"
    | "started"
    | "finished"
    | "delivered"
    | "accepted"
    | "rejected";
  requested_by_id: number;
  owner_ids: number[];
  labels: {
    kind: "label";
    id: number;
    project_id: number;
    name: string;
    created_at: string;
    updated_at: string;
  }[];
  created_at: string;
  updated_at: string;
  integration_id: number;
  external_id: string;
  url: string;
};
