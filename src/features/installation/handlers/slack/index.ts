import { App } from '@slack/bolt';
import appSettingsActionHandler from './app-settings-action';
import saveSettingsViewHandler from './save-settings-view';

export const registerInstallationHandlers = (app: App) => {
  app.action('app_settings', appSettingsActionHandler);
  app.view('settings_view', saveSettingsViewHandler);
};

export { appSettingsActionHandler, saveSettingsViewHandler };
