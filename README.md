# Sync GitHub + Pivotal Tracker

> Bi-directional syncing between Pivotal Tracker &amp; GitHub Issues

### Open Questions

- What do GitHub issues equate to? Pivotal Stories?
- What do GitHub PRs equate to? Links/Attachments in Pivotal Stories?
- What do GitHub Milestones equate to? Pivotal Epics?
- What do GitHub labels equate to? Pivotal Labels?
- What does Pivotal Story Points equate to? (Nothing)
- What do Pivotal Epics equate to? (GitHub Milestone? Single GitHub Issue with Epic label?)
- How to equate Pivotal Story Status with Issues/PRs?
- How to associate PR’s associate Issue with Pivotal?

### Prototype

- CLI to run some commands manually?
- Simple HTTP server (arc.codes? amplify function? There’ll be fallout if I don’t use Amplify)
- Local end-point testing? (ngrok?)
  - https://developer.github.com/webhooks/configuring/
- Pivotal webhook.
- GitHub webhook.

### Use-Cases

- When a New GitHub Issue is created, create a Pivotal Story with external_id.
- When a New GitHub Milestone is created, create a Pivotal Epic.
- When a GitHub Issue is assigned to a GitHub MileStone, assign Pivotal Story to Epic.
- When a GitHub Milestone is updated, update Pivotal Epic.

## Getting Started

1. `yarn`
1. `yarn dev` will open <http://localhost:3000>
1. `yarn tunnel` in another terminal to create an external tunnel (e.g. <https://5a7811ca.ngrok.io/api/github>):

   > Dashboard: http://localhost:4040/inspect/http
