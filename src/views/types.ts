import { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { Context } from 'vm';

export type OpenViewParams = {
  client: AllMiddlewareArgs['client'];
  body: SlackCommandMiddlewareArgs['body'];
  context: Context;
};
