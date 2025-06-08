// Custom type declarations for React.use() with Next.js params
declare global {
  namespace React {
    // Define a better-typed React.use function for NextJS params
    function use<T>(promise: T): T extends Promise<infer U> ? U : T;
  }
}

// Define a type for route params that can be used with React.use()
export interface RouteParams {
  id: string;
  [key: string]: string;
}

export {};
