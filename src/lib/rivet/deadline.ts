import { RivetError } from "./providers/errors";

/** Also bounds an operation that fails to settle after its signal is aborted. */
export async function withDeadline<T>(
  parent: AbortSignal | undefined,
  milliseconds: number,
  message: string,
  work: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  parent?.throwIfAborted();
  const controller = new AbortController();
  let reject!: (reason: unknown) => void;
  const stopped = new Promise<never>((_, fail) => {
    reject = fail;
  });
  const abort = () => {
    reject(new DOMException("The request was cancelled.", "AbortError"));
    controller.abort();
  };
  parent?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(() => {
    reject(new RivetError("timeout", message));
    controller.abort();
  }, milliseconds);
  try {
    return await Promise.race([work(controller.signal), stopped]);
  } finally {
    clearTimeout(timer);
    parent?.removeEventListener("abort", abort);
    controller.abort();
  }
}
