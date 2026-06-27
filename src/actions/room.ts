'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// ─── TypeScript Types ─────────────────────────────────────────────────────────

export type RoomInput = {
  apartmentId: string
  name: string
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'
  isDaily?: boolean
  rent?: number
  commonFee?: number
  elecMeterType?: 'SINGLE' | 'DOUBLE'
  waterMeterType?: 'UNIT' | 'FLAT' | 'PERSON_MIN'
  occupantsCount?: number
  elecRate?: number | null
  waterRate?: number | null
  waterMinCharge?: number | null
  waterFlatRate?: number | null
  paymentDate?: number | null
  note?: string | null
  tenantName?: string | null
  tenantPhone?: string | null
}

// ─── Query Functions ──────────────────────────────────────────────────────────

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

// ─── Mutation Functions ───────────────────────────────────────────────────────

export async function createRoom(data: RoomInput) {
  try {
    const room = await prisma.room.create({ data })
    revalidatePath(`/apartments/${data.apartmentId}`)
    return room
  } catch (error) {
    console.error('[createRoom]', error)
    throw new Error('เกิดข้อผิดพลาดในการสร้างห้องพัก กรุณาลองใหม่อีกครั้ง')
  }
}

export async function updateRoom(id: string, data: Partial<RoomInput>) {
  try {
    const room = await prisma.room.update({ where: { id }, data })
    revalidatePath(`/apartments/${room.apartmentId}`)
    revalidatePath(`/rooms/${id}`)
    return room
  } catch (error) {
    console.error('[updateRoom]', error)
    throw new Error('เกิดข้อผิดพลาดในการแก้ไขข้อมูลห้องพัก กรุณาลองใหม่อีกครั้ง')
  }
}

export async function deleteRoom(id: string, apartmentId: string) {
  try {
    const room = await prisma.room.delete({ where: { id } })
    revalidatePath(`/apartments/${apartmentId}`)
    revalidatePath('/')
    return room
  } catch (error) {
    console.error('[deleteRoom]', error)
    throw new Error('เกิดข้อผิดพลาดในการลบห้องพัก กรุณาลองใหม่อีกครั้ง')
  }
}

