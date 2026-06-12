'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getApartments() {
  return await prisma.apartment.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function getApartment(id: string) {
  return await prisma.apartment.findUnique({
    where: { id },
    include: { rooms: true }
  })
}

export async function getRoomsForFastBilling(apartmentId: string) {
  return await prisma.room.findMany({
    where: { apartmentId },
    include: {
      invoices: {
        orderBy: [{ billingYear: 'desc' }, { billingMonth: 'desc' }],
        take: 1
      }
    },
    orderBy: { name: 'asc' }
  })
}

export async function createApartment(data: any) {
  const apartment = await prisma.apartment.create({
    data
  })
  revalidatePath('/apartments')
  return apartment
}

export async function updateApartment(id: string, data: any) {
  const apartment = await prisma.apartment.update({
    where: { id },
    data
  })
  revalidatePath('/apartments')
  revalidatePath(`/apartments/${id}`)
  return apartment
}
