// Define React.use() for Next.js
declare global {
  namespace React {
    function use<T>(promise: Promise<T>): T;
    function use<T>(value: T): T;
  }
}

// We need a simple interface with the id property
export interface IdParams {
  id: string;
  [key: string]: string;
}

// For compatibility with Next.js
export type RouteParams = Promise<IdParams>;

export {};
