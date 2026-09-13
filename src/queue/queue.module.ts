import { Module } from '@nestjs/common';
import { ConcurrencyQueueService } from './concurrency-queue.service';

@Module({
  providers: [ConcurrencyQueueService],
  exports: [ConcurrencyQueueService],
})
export class QueueModule {}

