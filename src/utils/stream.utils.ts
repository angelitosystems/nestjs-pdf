import { Readable } from 'stream';

/**
 * Creates a new Readable stream from a Buffer.
 */
export function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

