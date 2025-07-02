# Taskless Packs: Stripe

> Taskless Packs are plugins that enable service-specific functionality in Taskless. To use this pack, you need to install it into your Taskless instance using either the [Taskless CLI](https://github.com/taskless/pack) or the [Taskless Cloud](https://www.taskless.io) interface.

# Pack Overview

This pack provides additional instrumentation for requests to the Stripe service (stripe.com). It captures details about requests and responses, including error details, workbench URLs, and more. The pack is designed to help you monitor and debug your Stripe integrations by providing insights into the requests and responses that your application sends to and receives from Stripe.

# Installation

You can install this pack via Taskless Cloud, or via the Taskless CLI using the `pack.tgz` from the releases page.

```bash
# Taskless CLI
pnpm dlx @taskless/pack@latest install "<url/to/pack.tgz>"
```

# Configuration

This pack can enable/disable specific telemetry features via its configuration.

# FAQs

- **What data is sent to Taskless or my Console?** By default, this pack captures only error information and workbench URLs. In the future, we plan to support the ability to fetch workbench details without transmitting any additional data to Taskless.
