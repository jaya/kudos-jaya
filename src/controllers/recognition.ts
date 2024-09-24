import { AllMiddlewareArgs } from '@slack/bolt';
import { AppDataSource } from '../data-source';
import { Recognition } from '../entity/recognition';
import { getSlackUserInfo } from '../utils/user-slack-info';
import { WalletController } from './wallet';

export class RecognitionController {
  constructor(
    private fromId: string,
    private toId: string,
    private client: AllMiddlewareArgs['client']
  ) {}

  public async save() {
    const recognition = new Recognition();
    recognition.fromId = this.fromId;
    recognition.fromName = await getSlackUserInfo(this.client, this.fromId);
    recognition.toName = await getSlackUserInfo(this.client, this.toId);
    recognition.toId = this.toId;
    try {
      const response = await AppDataSource.manager.save(recognition);
      if (response.id) {
        //TODO: definir env para o valor default
        await new WalletController(this.toId, 100).deposit();
      }
      return { ok: true };
    } catch (error) {
      console.error(error);
      return { ok: false };
    }
  }
}
