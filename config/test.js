const settings = {
  app: {
    slackConfig: {
      token: process.env.SLACK_BOT_TOKEN,
      appToken: process.env.SLACK_APP_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      logLevel: process.env.SLACK_LOGLEVEL || 'debug',
    },
  },
};
module.exports = settings;
