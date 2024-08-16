import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";

const RedeemWorkflow = DefineWorkflow({
    callback_id: "redeem_kudos_workflow",
    title: "Redeem Kudos",
    description: "Claim your prize at selected stores",
    input_parameters: {
        properties: {
            /**
             * This workflow users interactivity to collect input from the user.
             * Learn more: https://api.slack.com/automation/forms#add-interactivity
             */
            interactivity: {
                type: Schema.slack.types.interactivity,
            },
        },
        required: ["interactivity"],
    },
});

/**
 * Collecting input from users can be done with the built-in OpenForm function
 * as the first step.
 * Learn more: https://api.slack.com/automation/functions#open-a-form
 */
RedeemWorkflow.addStep(
    Schema.slack.functions.OpenForm,
    {
        title: "Redeem Kudos",
        interactivity: RedeemWorkflow.inputs.interactivity,
        submit_label: "Redeem",
        description: "Claim your prize at selected stores",
        fields: {
            elements: [
                {
                    name: "store_name",
                    title: "Select the store where you want to use your credits : ",
                    description: "All of these stores are available in Smash",
                    type: Schema.types.string,
                    enum: [
                        "Amazon 🫂",
                        "Magalu 🏆"
                    ],
                }, {
                    name: "redemption_value",
                    title: "How much would you like to withdraw ?",
                    type: Schema.types.number
                }],
            required: [
                "store_name",
                "redemption_value"
            ],
        },
    },
);

export { RedeemWorkflow };