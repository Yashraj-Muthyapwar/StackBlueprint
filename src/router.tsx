import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { createIsomorphicFn, getGlobalStartContext } from "@tanstack/react-start";
import { routeTree } from "./routeTree.gen";

/**
 * The per-request CSP nonce created in server.ts. TanStack Start stamps it on
 * the scripts it renders; on the client it reads it back from the
 * `csp-nonce` meta tag rendered in __root.tsx.
 */
const getCspNonce = createIsomorphicFn()
  .server(() => {
    try {
      const nonce = (getGlobalStartContext() as { nonce?: unknown } | undefined)?.nonce;
      return typeof nonce === "string" ? nonce : undefined;
    } catch {
      return undefined; // outside a page request
    }
  })
  .client(() => undefined);

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    ssr: { nonce: getCspNonce() },
  });

  return router;
};
