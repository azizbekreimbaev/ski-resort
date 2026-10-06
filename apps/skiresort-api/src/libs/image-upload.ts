import { BadRequestException } from '@nestjs/common';
import { mkdir, open, unlink } from 'fs/promises';
import { resolve } from 'path';
import type { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { getSerialForImage, validMimeTypes } from './config';
import { Message } from './enums/common.enum';

export interface ImageUpload {
  filename: string;
  mimetype: string;
  createReadStream: () => Readable;
}

export function assertGenericUploadTarget(target: string): void {
  if (/^events(?:\/|$)/i.test(target)) {
    throw new BadRequestException('Use the admin uploadEventImages operation');
  }
}

export async function saveImageUpload(
  { filename, mimetype, createReadStream }: ImageUpload,
  target: string,
): Promise<string> {
  if (!filename) throw new Error(Message.UPLOAD_FAILED);
  if (!validMimeTypes.includes(mimetype)) {
    throw new Error(Message.PROVIDE_ALLOWED_FORMAT);
  }
  // Accept directory names (including nested ones), never absolute/traversal paths.
  if (!/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(target)) {
    throw new BadRequestException('Invalid upload target');
  }

  const imageName = getSerialForImage(filename);
  const url = `uploads/${target}/${imageName}`;
  const directory = resolve(process.cwd(), 'uploads', target);
  const destinationPath = resolve(directory, imageName);
  await mkdir(directory, { recursive: true });
  // Open first so even an immediate source failure has a known, owned file.
  const file = await open(destinationPath, 'wx');
  try {
    await pipeline(createReadStream(), file.createWriteStream());
  } catch (error) {
    await file.close().catch(() => undefined);
    await unlink(destinationPath).catch(() => undefined);
    throw error;
  }
  return url;
}
