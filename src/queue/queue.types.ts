export interface QueueTaskOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface QueueOptions {
  concurrency?: number;
  queueTimeout?: number;
  onWaiting?: (queueSize: number) => void;
  onCompleted?: () => void;
}
