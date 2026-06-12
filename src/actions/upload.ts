'use server'

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) {
    throw new Error('No file provided')
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Convert to Base64 data URI
  const mimeType = file.type || 'image/png'
  const base64Image = `data:${mimeType};base64,${buffer.toString('base64')}`

  return base64Image
}
