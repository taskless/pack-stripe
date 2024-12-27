type RPCInput<
  TContext = unknown,
  TRequestBody = unknown,
  TResponseBody = unknown
> = {
  request: {
    domain: string;
    path: string;
    url: string;
    method: string;
    headers: [string, string][];
    body?: TRequestBody;
  };
  response?: {
    status: number;
    headers?: [string, string][];
    body?: TResponseBody;
  };
  context: TContext;
};

type RPCOutput<TContext = unknown> = {
  capture?: Record<string, string | number>;
  context?: TContext;
};

type Context = {};

type PreInput = RPCInput<Context, unknown, unknown>;

type PreOutput = RPCOutput<Context>;

type PostInput = RPCInput<Context, unknown, {
  error?: {
    type: "api_error" | "card_error" | "idempotency_error" | "invalid_request_error",
    code?: string | null
    message?: string | null
    doc_url?: string | null
    request_log_url?: string | null
  }
}>;
type PostOutput = RPCOutput;

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

  if (!input.response.body || !input.response.body.error) {
    Host.outputString(JSON.stringify({}));
    return;
  }

  const errorData: Record<string, string|number> = {};
  for (const [name, value] of Object.entries(input.response.body.error)) {
    if (value) {
      errorData[name] = value;
    }
  }

  const output: PostOutput = {
    capture: {
      ...errorData
    },
  };

  Host.outputString(JSON.stringify(output));
}
