/**
 * Serializes async work with a minimum gap between starts.
 * Used to honor public Nominatim ≤1 req/sec policy.
 */
export class RequestGate {
  private readonly minIntervalMs: number;
  private chain: Promise<void> = Promise.resolve();
  private lastStartedAt = 0;

  constructor(minIntervalMs: number) {
    this.minIntervalMs = minIntervalMs;
  }

  schedule<T>(
    task: () => Promise<T>,
    signal?: AbortSignal,
  ): Promise<T> {
    const run = this.chain.then(async () => {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const wait = this.minIntervalMs - (Date.now() - this.lastStartedAt);
      if (wait > 0) {
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(resolve, wait);
          const onAbort = () => {
            clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
          };
          if (signal) {
            if (signal.aborted) {
              onAbort();
              return;
            }
            signal.addEventListener('abort', onAbort, { once: true });
          }
        });
      }

      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      this.lastStartedAt = Date.now();
      return task();
    });

    // Keep the chain alive even when a task fails or is aborted.
    this.chain = run.then(
      () => undefined,
      () => undefined,
    );

    return run;
  }
}
