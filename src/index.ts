import type { PluginInput as TPI, PluginOutput } from "@taskless/loader/core";

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

type PreInput = TPI;
type PostInput = TPI<unknown, unknown, StripeResponse>;

/**
 * pre hook function
 * permissions:
 *  request: headers
 * capture:
 *  idempotencyKey
 */
export function pre() {
  const input = JSON.parse(Host.inputString()) as PreInput;

  // TODO: This is throwing "not a function"
  // const idempotencyKey = (input.request.headers ?? []).find(([key]) => key.toLowerCase() === "idempotency-key")?.[1];

  // const output:PreOutput = {
  //   capture: {
  //     ...(idempotencyKey ? { idempotencyKey } : {}),
  //   }
  // }

  // Host.outputString(JSON.stringify(output));
  Host.outputString(JSON.stringify({}));
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
  const input = JSON.parse(Host.inputString()) as PostInput;

  if (!input.response) {
    Host.outputString(JSON.stringify({}));
    return;
  }

  // TODO: make this a correct type based on TResponseBody being set
  if (input.response.status < 400) {
    Host.outputString(JSON.stringify({}));
    return;
  }

  if (!input.response.body?.error) {
    Host.outputString(JSON.stringify({}));
    return;
  }

  const errorData: Record<string, string | number> = {};
  for (const [name, value] of Object.entries(input.response.body.error)) {
    if (value) {
      errorData[name] = value;
    }
  }

  const output: PluginOutput = {
    capture: {
      ...errorData,
    },
  };

  Host.outputString(JSON.stringify(output));
}
