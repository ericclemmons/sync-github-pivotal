# Sync GitHub + Pivotal Tracker

> Bi-directional syncing between Pivotal Tracker &amp; GitHub Issues

### How it Works

**GitHub is the source of truth:**

- When a New GitHub Issue is created, create a Pivotal Story with `external_id`.
- When a New GitHub Milestone is created, create a Pivotal Epic.
- When a GitHub Issue is assigned to a GitHub MileStone, assign Pivotal Story to Epic.
- When a GitHub Milestone is updated, update Pivotal Epic.
- When a GitHub Label is assigned, create & assign label in Pivotal.
- Sync GitHub Issue descriptions with Pivotal Story.

### What's Missing

- Sync Pivotal back to GitHub

## Getting Started

0. `cp .env.example .env` and [adjust accordingly](/.env.example)
1. `yarn`
1. `yarn start` will open <http://localhost:3000>
1. `yarn tunnel` in another terminal to create an external tunnel (e.g. <https://5a7811ca.ngrok.io/api/github>):

   > Dashboard: http://localhost:4040/inspect/http

1. Add webhook to GitHub (e.g. https://github.com/ORG/REPO/settings/hooks/new) with the following permissions:

   - Issues
   - Milestones
   - Pull Requests
   - Pull request reviews
   - Pull request review comments
