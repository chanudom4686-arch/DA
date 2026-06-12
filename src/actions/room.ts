'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getRooms(apartmentId: string) {
  return await prisma.room.findMany({
    where: { apartmentId },
    orderBy: { name: 'asc' }
  })
}

export async function getRoom(id: string) {
  return await prisma.room.findUnique({
    where: { id }
  })
}

export async function createRoom(data: any) {
  const room = await prisma.room.create({
    data
  })
  revalidatePath(`/apartments/${data.apartmentId}`)
  return room
}

export async function updateRoom(id: string, data: any) {
  const room = await prisma.room.update({
    where: { id },
    data
  })
  revalidatePath(`/apartments/${room.apartmentId}`)
  revalidatePath(`/rooms/${id}`)
  return room
}

export async function deleteRoom(id: string, apartmentId: string) {
  const room = await prisma.room.delete({
    where: { id }
  })
  revalidatePath(`/apartments/${apartmentId}`)
  revalidatePath('/')
  return room
}
