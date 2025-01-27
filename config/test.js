const settings = {
  app: {
    slackConfig: {
      token: process.env.SLACK_BOT_TOKEN,
      appToken: process.env.SLACK_APP_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      logLevel: process.env.SLACK_LOGLEVEL || 'debug',
    },
  },
  externalClients: {
    todoCartoes: {
      token: 'token',
      baseUrl:
        process.env.TODO_BASE_URL ||
        'https://corporate-api-gateway.todocartoes.com.br/staging/v2',
      cacheTtl: process.env.TODO_CACHE_TTL || 604800,
    },
  },
};
module.exports = settings;
