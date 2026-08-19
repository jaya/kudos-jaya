import { MessagePublisher } from './message-publisher';
import { ModalManager } from './modal-manager';
import { UserInfoProvider } from './user-info-provider';
import { FileUploader } from './file-uploader';

export interface PlatformAdapter
  extends MessagePublisher, ModalManager, UserInfoProvider, FileUploader {
  getPlatformName(): string;
}
