const settings = {
  app: {
    deposit: {
      defaultAmount: Number(process.env.DEPOSIT_DEFAULT_AMOUNT) || 100,
    },
    recognition: {
      defaultChannel: process.env.DEFAULT_RECOGNITION_CHANNEL || '#wearejaya',
    },
    slackConfig: {
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      clientId: process.env.SLACK_CLIENT_ID,
      clientSecret: process.env.SLACK_CLIENT_SECRET,
      stateSecret: process.env.SLACK_STATE_SECRET,
      token: process.env.SLACK_BOT_TOKEN,
      appToken: process.env.SLACK_APP_TOKEN,

      logLevel: process.env.SLACK_LOGLEVEL || 'debug',
    },
    port: process.env.PORT || 3000,
    productsPageSize: process.env.PRODUCTS_PAGE_SIZE || 5,
    baseUrl: process.env.APP_BASE_URL || 'localhost',
  },
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  externalClients: {
    todoCartoes: {
      token: process.env.TODO_TOKEN || 'token',
      baseUrl:
        process.env.TODO_BASE_URL ||
        'https://corporate-api-gateway.todocartoes.com.br/staging/v2',
      cacheTtl: process.env.TODO_CACHE_TTL || 604800,
    },
  },
};
module.exports = settings;
