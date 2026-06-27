'use server'

import { put } from '@vercel/blob';

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file provided');
  }

  const blob = await put(file.name, file, {
    access: 'public',
  });

  return blob.url;
}
