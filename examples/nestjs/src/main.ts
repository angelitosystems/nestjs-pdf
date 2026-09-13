import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`NestJS PDF Demo server running at http://localhost:${port}`);
  console.log(`- Download invoice: http://localhost:${port}/invoices/1001/download`);
  console.log(`- View invoice:     http://localhost:${port}/invoices/1001/view`);
  console.log(`- Base64 Buffer:    http://localhost:${port}/invoices/1001/buffer`);
  console.log(`- Save to disk:     http://localhost:${port}/invoices/1001/save`);
}

if (require.main === module) {
  bootstrap().catch(console.error);
}

