// Define React.use() for Next.js
declare global {
  namespace React {
    function use<T>(promise: Promise<T>): T;
    function use<T>(value: T): T;
  }
}

export interface IdParams {
  id: string;
  [key: string]: string;
}

// Removed PageProps interface to avoid conflicts with Vercel's generated types

export {};
