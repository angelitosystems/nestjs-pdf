import { ConcurrencyQueue } from '../../src/utils/concurrency-queue';
import { PdfAbortError, PdfTimeoutError } from '../../src/pdf/pdf.exceptions';

describe('ConcurrencyQueue', () => {
  it('should enforce concurrency limit', async () => {
    const queue = new ConcurrencyQueue({ concurrency: 2 });
    let maxRunning = 0;
    let currentlyRunning = 0;

    const createTask = (delayMs: number) => async () => {
      currentlyRunning++;
      maxRunning = Math.max(maxRunning, currentlyRunning);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      currentlyRunning--;
      return delayMs;
    };

    const promises = [
      queue.run(createTask(50)),
      queue.run(createTask(50)),
      queue.run(createTask(50)),
      queue.run(createTask(50)),
    ];

    const results = await Promise.all(promises);

    expect(results).toEqual([50, 50, 50, 50]);
    expect(maxRunning).toBe(2);
    expect(queue.runningCount).toBe(0);
    expect(queue.pendingCount).toBe(0);
  });

  it('should process tasks in FIFO order', async () => {
    const queue = new ConcurrencyQueue({ concurrency: 1 });
    const executedOrder: number[] = [];

    const task1 = queue.run(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
      executedOrder.push(1);
    });

    const task2 = queue.run(async () => {
      executedOrder.push(2);
    });

    const task3 = queue.run(async () => {
      executedOrder.push(3);
    });

    await Promise.all([task1, task2, task3]);
    expect(executedOrder).toEqual([1, 2, 3]);
  });

  it('should reject with PdfTimeoutError when waiting in queue exceeds queueTimeout', async () => {
    const queue = new ConcurrencyQueue({ concurrency: 1, queueTimeout: 50 });

    // Task 1 blocks the queue for 100ms
    const blocker = queue.run(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return 'ok';
    });

    // Task 2 will wait more than 50ms in queue, so it should time out
    const timedOutTask = queue.run(async () => 'will not run');

    await expect(timedOutTask).rejects.toThrow(PdfTimeoutError);
    await expect(blocker).resolves.toBe('ok');
  });

  it('should reject with PdfAbortError when signal is already aborted', async () => {
    const queue = new ConcurrencyQueue({ concurrency: 2 });
    const controller = new AbortController();
    controller.abort();

    await expect(
      queue.run(async () => 'ok', { signal: controller.signal }),
    ).rejects.toThrow(PdfAbortError);
  });

  it('should reject with PdfAbortError when signal is aborted while waiting in queue', async () => {
    const queue = new ConcurrencyQueue({ concurrency: 1 });
    const controller = new AbortController();

    // Blocker
    const blocker = queue.run(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return 'ok';
    });

    const waitingTask = queue.run(async () => 'ok', { signal: controller.signal });

    // Abort while task is waiting in queue
    setTimeout(() => {
      controller.abort();
    }, 10);

    await expect(waitingTask).rejects.toThrow(PdfAbortError);
    await expect(blocker).resolves.toBe('ok');
  });

  it('should release concurrency slot and continue next task even if current task throws', async () => {
    const queue = new ConcurrencyQueue({ concurrency: 1 });

    const failingTask = queue.run(async () => {
      throw new Error('Task failure');
    });

    const succeedingTask = queue.run(async () => {
      return 'success';
    });

    await expect(failingTask).rejects.toThrow('Task failure');
    await expect(succeedingTask).resolves.toBe('success');
    expect(queue.runningCount).toBe(0);
  });

  it('should reject pending tasks when queue is destroyed', async () => {
    const queue = new ConcurrencyQueue({ concurrency: 1 });

    const blocker = queue.run(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return 'blocker';
    });

    const queuedTask = queue.run(async () => 'pending');

    queue.destroy('Module shut down');

    await expect(queuedTask).rejects.toThrow(PdfAbortError);
    await expect(blocker).resolves.toBe('blocker');
  });
});

