export type NativeTimeout = ReturnType<typeof setTimeout>;
export type DistributedOmit<T, K extends keyof T> = T extends T ? Omit<T, K> : never;
