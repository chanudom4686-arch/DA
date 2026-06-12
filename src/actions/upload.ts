'use server'

import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file provided');
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  
  // If Vercel Blob is configured
  if (token) {
    const blob = await put(file.name, file, {
      access: 'public',
      token
    });
    return blob.url;
  } 
  
  // Local fallback
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }
  
  const filename = `${Date.now()}-${file.name}`;
  const filepath = join(uploadsDir, filename);
  await writeFile(filepath, buffer);
  
  return `/uploads/${filename}`;
}
