type AllKeys<T> = T extends unknown ? keyof T : never;
type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;
type _ExclusifyUnion<T, K extends PropertyKey> =
    T extends unknown ? Id<T & Partial<Record<Exclude<K, keyof T>, never>>> : never;
type __ExclusifyUnion<T> = _ExclusifyUnion<T, AllKeys<T>>;
export type {__ExclusifyUnion as ExclusifyUnion}
export type ExclusifyProps<T> = {
    [K in keyof T]: __ExclusifyUnion<T[K]>;
}
