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

## Deployment

The application is deployed to a DigitalOcean droplet via GitHub Actions. Every push to the `main` branch triggers a new deployment.

The deployment process is defined in the `.github/workflows/deploy.yml` file. It consists of the following steps:

1.  Checkout the code.
2.  SSH into the DigitalOcean droplet.
3.  Pull the latest changes from the `main` branch.
4.  Install dependencies with `npm install`.
5.  Build the application with `npm run build`.
6.  Restart the application with `pm2`.

---

Your Kudos Jaya Slack app is now ready to use! 🎉

### How to generate an API key

1. Clone the project
2. Run the `/src/utils/test/authMiddleware.test.ts` test
3. Copy the client API key outputed in the console and give to the client
4. Store the hashed API key in the `installation.clientApiKey` table in the DB associated to the client

### How to get the logs

`pm2 logs kudos-jaya --out --raw | grep --line-buffered '"severity":"error"' | jq`
