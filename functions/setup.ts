import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import WorkspaceDataStore, { Workspace } from "../datastores/workspace.ts";
import { renderConfigurationView } from "../views/config_manager/initial_setup.ts";

export const SetupFunction = DefineFunction({
  callback_id: "setup_function",
  title: "Setup Kudos",
  source_file: "functions/setup.ts",
  input_parameters: {
    properties: {
      user_id: {
        type: Schema.slack.types.user_id,
      },
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["user_id", "interactivity"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(
  SetupFunction,
  async ({ inputs, client }) => {
    try {
      let { is_admin } = await client.users.info({ user: inputs.user_id });
      //TODO: remover o usuario hardcoded
      if (inputs.user_id === "U04LB5U5125") {
        is_admin = true;
      }

      if (!is_admin) {
        const ret = await client.chat.postMessage({
          channel: inputs.user_id,
          text:
            "Too bad, you are not a slack admin, so you cannot configure this APP :cry:",
        });
        if (!ret.ok) throw new Error(ret.error);
        return { outputs: { allowed: false } };
      }

      const ret = await client.views.open({
        trigger_id: inputs.interactivity.interactivity_pointer,
        view: renderConfigurationView(),
      });
      if (!ret["ok"]) throw new Error(ret.error);

      return { completed: false };
    } catch (error) {
      console.error(error);
      return { completed: false };
    }
  },
).addViewSubmissionHandler(
  "initial_configuration_view",
  async ({ inputs, view, client, body }) => {
    const smashToken =
      view.state.values["set_token_block"]["smash_api_token_value"]["value"];

    const alreadyExists = await WorkspaceDataStore.getWorkspace(client);
    console.log("alreadyExists " + JSON.stringify(alreadyExists));
    const { team } = await client.team.info();

    if (alreadyExists) {
      const updated: Workspace = {
        id: alreadyExists.id,
        name: team.name,
        slack_id: team.id,
        smash_token: smashToken,
      };

      const success = await WorkspaceDataStore.updateWorkspace(client, updated);

      if (!success) {
        await client.chat.postMessage({
          channel: inputs.user_id,
          text: "Error while trying to update workspace config :cry:",
        });

        await client.functions.completeError({
          error: "Error while trying to update workspace config",
          function_execution_id: body.function_data.execution_id,
        });
      }

      await client.chat.postMessage({
        channel: inputs.user_id,
        text: "Workspace settings updated successfully :rocket:",
      });

      await client.functions.completeSuccess({
        function_execution_id: body.function_data.execution_id,
        outputs: {},
      });
      return;
    }

    const workspaceConfig: Workspace = {
      id: crypto.randomUUID(),
      name: team.name,
      slack_id: team.id,
      smash_token: smashToken,
    };

    const success = await WorkspaceDataStore.createWorkspace(
      client,
      workspaceConfig,
    );

    if (!success) {
      await client.functions.completeError({
        error: "Error while trying to create workspace config",
        function_execution_id: body.function_data.execution_id,
      });
    }

    await client.chat.postMessage({
      channel: inputs.user_id,
      text: "Kudos workspace settings have been saved :rocket:",
    });

    await client.functions.completeSuccess({
      function_execution_id: body.function_data.execution_id,
      outputs: {},
    });
    return;
  },
);
