import * as winston from "winston";
import type { ConsoleTransportInstance } from "winston/lib/winston/transports";

import { format } from "./format";
import { DevConsoleTransportOptions } from "./types";

export function transport(name: string, opts?: DevConsoleTransportOptions): ConsoleTransportInstance {
  return new winston.transports.Console({
    format: format(name, opts),
  });
}
