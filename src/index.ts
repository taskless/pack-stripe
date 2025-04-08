import {
  type PluginInput as PI,
  type PluginOutput as PO,
} from "@taskless/loader";
import { z } from "zod";
import { type Pack } from "./__generated__/pack.js";
import { isValidHost, readInput, writeOutput } from "./helpers.js";
import { manifest } from "./manifest.js";

type PluginInput<
  TContext = unknown,
  TRequest = unknown,
  TResponse = unknown,
> = PI<TContext, TRequest, TResponse> & Pick<Pack, "configuration">;

type PluginOutput<TContext = unknown> = PO<TContext> &
  Pick<Pack, "configuration">;

/**
 * The stripe response is the OpenAPI response, not the object
 * exposed via SDKs
 */
type StripeResponse = {
  error?: {
    type:
      | "api_error"
      | "card_error"
      | "idempotency_error"
      | "invalid_request_error";
    // eslint-disable-next-line @typescript-eslint/ban-types
    code?: string | null;
    // eslint-disable-next-line @typescript-eslint/ban-types
    message?: string | null;
    // eslint-disable-next-line @typescript-eslint/ban-types
    doc_url?: string | null;
    // eslint-disable-next-line @typescript-eslint/ban-types
    request_log_url?: string | null;
  };
};

const configuration = z
  .object({
    domains: z.array(z.string()).default(["api.stripe.com"]),
    enableSuccess: z.boolean().default(false),
  })
  .default({
    domains: ["api.stripe.com"],
    enableSuccess: false,
  });

export function pre() {
  const input = readInput<PluginInput>();
  const userConfig = configuration.parse(input.configuration);

  // if there's no domains, then this is a v1 loader calling us
  // so we skip the domain check
  if (!isValidHost(input.request.domain, userConfig.domains)) {
    writeOutput<PluginOutput>({});
    return;
  }

  const idempotencyKey = (input.request.headers ?? []).find(
    ([key]) => key.toLowerCase() === "idempotency-key"
  )?.[1];

  writeOutput<PluginOutput>({
    capture: {
      ...(idempotencyKey ? { idempotencyKey } : {}),
    },
  });
}

/**
 * post hook function
 * permissions:
 *  response: headers
 * capture:
 *  type: string (enum)
 *  code: string - stripe error detail code
 *  message: string - the good stuff (human readable explanation)
 *  doc_url: string - link to the stripe documentation
 *  request_log_url: string - link to the stripe request log
 */
export function post() {
  const input = readInput<PluginInput<unknown, unknown, StripeResponse>>();
  const userConfig = configuration.parse(input.configuration);

  // if there's no domains, then this is a v1 loader calling us
  // so we skip the domain check
  if (!isValidHost(input.request.domain, userConfig.domains)) {
    writeOutput<PluginOutput>({});
    return;
  }

  if (!input.response) {
    Host.outputString(JSON.stringify({}));
    return;
  }

  const capture: {
    status?: number;
    errorType?: string;
    errorCode?: string;
    errorMessage?: string;
    errorDocUrl?: string;
    errorRequestLogUrl?: string;
  } = {};

  if (input.response.status >= 400 || userConfig.enableSuccess) {
    capture.status = input.response.status;
    return;
  }

  if (input.response.body?.error) {
    capture.errorCode = input.response.body.error.code ?? undefined;
    capture.errorMessage = input.response.body.error.message ?? undefined;
    capture.errorDocUrl = input.response.body.error.doc_url ?? undefined;
    capture.errorRequestLogUrl =
      input.response.body.error.request_log_url ?? undefined;
    capture.errorType = input.response.body.error.type ?? undefined;
  }

  // this removes all undefined from the capture object
  // eslint-disable-next-line unicorn/prefer-structured-clone
  const finalizedCapture = JSON.parse(JSON.stringify(capture)) as Record<
    string,
    unknown
  >;

  writeOutput({
    capture: {
      ...finalizedCapture,
    },
  });
}
