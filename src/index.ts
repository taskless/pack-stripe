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

type Context = {
  start: number;
};

type PreInput = RPCInput;
type PreOutput = RPCOutput<Context>;

type PostInput = RPCInput<Context, unknown, Record<string, any>>;
type PostOutput = RPCOutput;

export function pre() {
  const input = JSON.parse(Host.inputString()) as PreInput;

  const output: PreOutput = {
    capture: {
      domain: input.request.domain,
      url: input.request.url,
      path: input.request.path,
    },
    context: {
      start: Date.now(),
    },
  };

  Host.outputString(JSON.stringify(output));
}

export function post() {
  const input = JSON.parse(Host.inputString()) as PostInput;

  let error: string | undefined;
  if (input.response?.status && input.response.status >= 400) {
    error =
      input.response.body?.error ??
      input.response.body?.message ??
      input.response.body?.err?.type;
  }

  const output: PostOutput = {
    capture: {
      durationMs: Date.now() - input.context.start,
      ...(input.response?.status ? { status: input.response.status } : {}),
      ...(error ? { error } : {}),
    },
  };

  Host.outputString(JSON.stringify(output));
}
