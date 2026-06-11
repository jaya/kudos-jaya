export interface SettingsModalView {
  type: 'modal';
  callback_id: 'settings_view';
  title: {
    type: 'plain_text';
    text: string;
  };
  blocks: unknown[];
  submit: {
    type: 'plain_text';
    text: string;
  };
}
