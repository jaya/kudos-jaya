export interface ModalManager {
  openModal(params: {
    triggerId: string;
    view: Record<string, unknown>;
  }): Promise<void>;

  updateModal(params: {
    viewId: string;
    view: Record<string, unknown>;
  }): Promise<void>;

  pushModal(params: {
    triggerId: string;
    view: Record<string, unknown>;
  }): Promise<void>;

  closeModal(params: { viewId: string }): Promise<void>;

  publishHomeTab(params: {
    userId: string;
    view: Record<string, unknown>;
  }): Promise<void>;
}
