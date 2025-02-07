# Kudos Jaya - Slack App

## Table of Contents

- [About](#about)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application Locally](#running-the-application-locally)
  - [Exposing the App with Ngrok](#exposing-the-app-with-ngrok)
  - [Installing the App in Slack](#installing-the-app-in-slack)
- [Staging Environment](#staging-environment)
- [Production Deployment](#production-deployment)
  - [Tagging a New Release](#tagging-a-new-release)

## About

Kudos Jaya is a Slack application built with Node.js and TypeScript, utilizing the [Slack Bolt](https://slack.dev/bolt-js/) framework to facilitate kudos exchange among team members. It integrates with external services like Giphy and a card issuance API.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (latest LTS version recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Ngrok](https://ngrok.com/) (for exposing local development server to Slack)
- [PostgreSQL](https://www.postgresql.org/) (for database storage)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/l3co/kudos-jaya.git
   cd kudos-jaya
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create the database and run migrations:
   ```sh
   npm run migration:gen
   npm run migration:up
   ```

### Environment Variables

Create a `.env` file in the project root and define the following variables:

#### Slack Configuration

- `SLACK_CLIENT_ID` - Found in Slack App under _Basic Information_
- `SLACK_CLIENT_SECRET` - Found in Slack App under _Basic Information_
- `SLACK_SIGNING_SECRET` - Found in Slack App under _Basic Information_
- `SLACK_STATE_SECRET` - Random string used in OAuth flow

#### Database Configuration

- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name

#### Other Configurations

- `ENCRYPTION_KEY` - A 32-character secret key for encrypting API tokens
- `GIPHY_API_KEY` - Giphy API key (obtain from [Giphy Developers](https://developers.giphy.com/))

### Running the Application Locally

Start the application:

```sh
npm run start:local
```

### Exposing the App with Ngrok

Slack needs to communicate with your local app. Use Ngrok to expose it:

```sh
ngrok http http://localhost:3000
```

Copy the generated public URL and update the `manifest.json` file in the project root. Replace all occurrences of the old URL with the new Ngrok URL.

Then, go to [Slack API Apps](https://api.slack.com/apps), navigate to _App Manifest_, and paste the updated `manifest.json` content.

### Installing the App in Slack

1. Open the Ngrok URL + `/slack/install/workspace`, e.g.:
   ```sh
   https://b211-163-116-228-136.ngrok-free.app/slack/install/workspace
   ```
2. Click the "Install" button to initiate the OAuth flow.
3. Accept the required permissions.
4. If installation succeeds, you will receive a DM from the bot prompting you to finalize the setup.
5. Click the button in the DM to open a modal where you can configure:
   - API Token for gift card issuance
   - Slack channel where kudos messages will be posted (e.g., `#bots` or channel ID `C98798465`)
   - Default kudos wallet balance ($100 by default)
6. Click "Finish" to complete the setup.
7. Add the bot to the designated channel by mentioning it (`@BotName`).

### Sending Kudos

Use the `/give-kudos` command in Slack to send kudos:

1. Select one or more users.
2. Enter your message.
3. Click "Share" to post it in the configured channel.

---

## Staging Environment

- The staging environment runs on **Google Cloud Platform (GCP)** and can be accessed at:
  ```
  https://console.cloud.google.com/run/detail/us-west1/kudos-jaya-hml/metrics?inv=1&invt=Abo8Hg&project=kudos-jaya-438616
  ```
- The database is a copy of the production database:
  ```
  https://console.cloud.google.com/sql/instances/kudos-jaya-instance/studio?inv=1&invt=Abo8Hg&project=kudos-jaya-438616
  ```
- Deployment to staging is automated via CI/CD:
  1. Create a branch from `main`, commit changes, and push.
  2. Run the Cloud Build trigger at:
     ```
     https://console.cloud.google.com/cloud-build/triggers;region=global?inv=1&invt=Abo70g&project=kudos-jaya-438616
     ```
  3. Select the trigger **"kudos-jaya-hml-trigger"**.
  4. Choose the branch and click **"Run trigger"**.
  5. Monitor deployment logs at:
     ```
     https://console.cloud.google.com/cloud-build/builds?inv=1&invt=Abo70g&project=kudos-jaya-438616
     ```

---

## Production Deployment

- The production environment runs on **GCP Cloud Run**:
  ```
  https://console.cloud.google.com/run/detail/us-west1/kudos-jaya/metrics?inv=1&invt=Abo8Hg&project=kudos-jaya-438616
  ```
- The production database is available at:

  ```
  https://console.cloud.google.com/sql/instances/kudos-jaya-instance/studio?inv=1&invt=Abo8Hg&project=kudos-jaya-438616
  ```

- Deployments are automated via CI/CD when a new tag is pushed.
- Environment variables and secrets are managed via **Google Cloud Secret Manager**.

### Tagging a New Release

1. Merge the Pull Request into `main`, ensuring **CHANGELOG.md** is updated.
2. Checkout `main`:
   ```sh
   git checkout main
   ```
3. Locally, generate a new version tag based on the change:
   ```sh
   make version-patch   # For patches (e.g., 1.0.1 → 1.0.2)
   make version-minor   # For minor updates (e.g., 1.0.2 → 1.1.0)
   make version-major   # For major updates (e.g., 1.1.0 → 2.0.0)
   ```
4. Push the new tag to trigger production deployment:
   ```sh
   git push --force-with-lease && git push --tags
   ```

Once pushed, CI/CD will automatically deploy the latest release to production.

---

Your Kudos Jaya Slack app is now ready to use! 🎉
