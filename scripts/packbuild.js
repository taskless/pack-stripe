/* eslint-disable camelcase */
import { writeFileSync } from "node:fs";
import path from "node:path";

const { resolve } = path;
const __dirname = new URL(".", import.meta.url).pathname;

const template = {
  name: "@taskless/stripe",
  description:
    "Capture details about stripe requests and responses, including error details, workbench URLs, and more.",
  version: "1.0.0",
  schema: "pre1",
  permissions: {
    domains: ["api.stripe.com"],
    request: ["headers"],
    response: ["body", "headers"],
  },
  capture: {
    idempotencyKey: {
      type: "string",
      description:
        "The idempotency key used in the request, used to help identify if the same request is being repeated multiple times",
    },
    type: {
      type: "string",
      description:
        "The type of error returned. One of api_error, card_error, idempotency_error, or invalid_request_error",
    },
    code: {
      type: "string",
      description:
        "The stripe API code. For some errors that could be handled programmatically, a short string indicating the error code reported.",
    },
    message: {
      type: "string",
      description:
        "The human-readable message providing more details about the error.",
    },
    doc_url: {
      type: "string",
      description:
        "A URL in the Stripe documentation that describes the error code's details.",
    },
    request_log_url: {
      type: "string",
      description: "A URL to the request log in the Stripe workbench",
    },
  },
};

writeFileSync(
  resolve(__dirname, "../dist/manifest.json"),
  JSON.stringify(template, null, 2)
);
