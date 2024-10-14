import { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { StringIndexed } from '@slack/bolt/dist/types/helpers';
import { Context } from 'vm';

export type OpenViewParams = {
  client: AllMiddlewareArgs['client'];
  body: SlackCommandMiddlewareArgs['body'];
  context: Context & StringIndexed;
};
