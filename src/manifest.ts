import { type Manifest } from "./__generated__/manifest.js";

export const manifest = {
  name: "@taskless/stripe",
  description:
    "Capture details about stripe requests and responses, including error details, workbench URLs, and more.",
  version: "1.0.1",
  schema: "pre2",
  permissions: {
    // no extended permissions required
  },
  fields: [
    {
      name: "domains",
      type: "string[]",
      description: "List of domains to capture telemetry for",
      default: ["api.stripe.com"],
    },
    {
      name: "enableSuccess",
      type: "boolean",
      description: "Enable success telemetry (tracks only errors by default)",
      default: false,
    },
  ],
} satisfies Manifest;
