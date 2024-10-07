const settings = {
  app: {
    deposit: {
      defaultAmount: Number(process.env.DEPOSIT_DEFAULT_AMOUNT) || 100,
    },
    recognition: {
      defaultChannel: process.env.DEFAULT_RECOGNITION_CHANNEL || 'wearejaya',
    },
    slackConfig: {
      token: process.env.SLACK_BOT_TOKEN,
      appToken: process.env.SLACK_APP_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      logLevel: process.env.SLACK_LOGLEVEL || 'debug',
    },
    port: process.env.PORT || 3000,
  },
  externalClients: {
    todoCartoes: {
      token: process.env.TODO_TOKEN || 'token',
      baseUrl:
        process.env.TODO_BASE_URL ||
        'https://corporate-api-gateway.todocartoes.com.br/staging/v2',
      cacheTtl: 3600,
    },
  },
};
module.exports = settings;
