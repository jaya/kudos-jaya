# Kudos Jaya

Share warm kudos and kind words with anyone in your workspace using functions
and a workflow!

1 - Cria a app em https://api.slack.com/apps "From an app manifest" e cola o manifest que está aqui no projeto
2 - Seta as envs
<br> 2. Open your apps configuration page from [this list](https://api.slack.com/apps), click _OAuth & Permissions_ in the left hand menu, then copy the _Bot User OAuth Token_ into your `.env` file under `SLACK_BOT_TOKEN` 3. Click _Basic Information_ from the left hand menu and follow the steps in the _App-Level Tokens_ section to create an app-level token with the `connections:write` scope. Copy that token into your `.env` as `SLACK_APP_TOKEN`.

3 - SLACK_SIGNING_SECRET não pode faltar essa
4 - Não pode ter o socketMode: true na instância da app
5 - Definir a signingSecret: process.env.SLACK_SIGNING_SECRET na instância da app
6 - Em https://api.slack.com/apps/A07N6B9AUNT/event-subscriptions? -> Ativar
7 - Será necessário colocar a URL do ambiente de prod ou desenvolvimento. Se ainda estiver em dev coloca pra rodar com ngrok. A URL que vai ser setada aqui tem que terminar com /slack/events
8 - Vai em https://api.slack.com/apps/A07N6B9AUNT/slash-commands? Edit -> Request URL coloca a URL do ambiente de prod ou local gerada pelo ngrok + /slack/events Vai ficar tipo: https://c160-2804-56c-c230-a800-76d7-258e-c01d-305.ngrok-free.app/slack/events

#### Install Dependencies

`npm install`

#### Run Bolt Server

`npm start`

Configurar a URL da app aqui
https://api.slack.com/apps/A07N6B9AUNT/interactive-messages

Adicionar o BOT ao canal
