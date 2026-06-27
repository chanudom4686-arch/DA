'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// ─── TypeScript Types ─────────────────────────────────────────────────────────

export type ApartmentInput = {
  name: string
  ownerName?: string | null
  ownerPhone?: string | null
  address?: string | null
  bankName?: string | null
  bankAccountName?: string | null
  bankAccountNumber?: string | null
  qrCodeUrl?: string | null
  billNote?: string | null
}

// ─── Query Functions ──────────────────────────────────────────────────────────

export async function getApartments() {
  return await prisma.apartment.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function getApartment(id: string) {
  return await prisma.apartment.findUnique({
    where: { id },
    include: { rooms: { include: { invoices: true }, orderBy: { name: 'asc' } } }
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

// ─── Mutation Functions ───────────────────────────────────────────────────────

export async function createApartment(data: ApartmentInput) {
  try {
    const apartment = await prisma.apartment.create({ data })
    revalidatePath('/')
    revalidatePath('/apartments')
    return apartment
  } catch (error) {
    console.error('[createApartment]', error)
    throw new Error('เกิดข้อผิดพลาดในการสร้างหอพัก กรุณาลองใหม่อีกครั้ง')
  }
}

export async function updateApartment(id: string, data: Partial<ApartmentInput>) {
  try {
    const apartment = await prisma.apartment.update({ where: { id }, data })
    revalidatePath('/')
    revalidatePath('/apartments')
    revalidatePath(`/apartments/${id}`)
    return apartment
  } catch (error) {
    console.error('[updateApartment]', error)
    throw new Error('เกิดข้อผิดพลาดในการแก้ไขข้อมูลหอพัก กรุณาลองใหม่อีกครั้ง')
  }
}

export async function deleteApartment(id: string) {
  try {
    const apartment = await prisma.apartment.delete({ where: { id } })
    revalidatePath('/')
    revalidatePath('/apartments')
    return apartment
  } catch (error) {
    console.error('[deleteApartment]', error)
    throw new Error('เกิดข้อผิดพลาดในการลบหอพัก กรุณาลองใหม่อีกครั้ง')
  }
}

