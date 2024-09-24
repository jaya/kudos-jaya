const settings = {
  externalClients: {
    todoCartoes: {
      token: process.env.TODO_TOKEN || 'token',
      baseUrl:
        process.env.TODO_BASE_URL ||
        'https://corporate-api-gateway.todocartoes.com.br/staging/v2',
    },
  },
};
module.exports = settings;
