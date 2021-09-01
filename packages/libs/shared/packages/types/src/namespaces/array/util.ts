export type IsArray<T, True = true, False = false> = T extends any[]
  ? Extract<keyof T, "0"> extends never
    ? False
    : True
  : T extends readonly any[]
  ? Extract<keyof T, "0"> extends never
    ? False
    : True
  : False;
