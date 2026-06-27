'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { Room } from '@prisma/client'

// ─── TypeScript Types ──────────────────────────────────────────────────────────

export type CustomItemInput = {
  name: string
  amount: number | string
}

export type InvoiceInput = {
  roomId: string
  type?: 'REGULAR' | 'SPECIAL'
  billingMonth: number
  billingYear: number
  billDate: Date | string
  checkIn?: Date | string | null
  checkOut?: Date | string | null
  oldElecMeter?: number | null
  newElecMeter?: number | null
  oldElecMeterB?: number | null
  newElecMeterB?: number | null
  oldWaterMeter?: number | null
  newWaterMeter?: number | null
  rentTotal?: number
  note?: string | null
  customItems?: CustomItemInput[]
}

// ─── Calculation Helper ───────────────────────────────────────────────────────
// แยก logic คำนวณออกมาเป็น function เดียว ป้องกันโค้ดซ้ำ

function calculateInvoiceTotals(room: Room, data: InvoiceInput) {
  let elecTotal = 0
  let waterTotal = 0
  let rentTotal = 0
  let commonFeeTotal = 0

  if (room.isDaily) {
    // ห้องรายวัน: คิดแค่ค่าเช่าที่กรอกมา
    rentTotal =
      data.rentTotal !== undefined
        ? parseFloat(String(data.rentTotal))
        : room.rent
        ? room.rent.toNumber()
        : 0
  } else {
    // ห้องรายเดือน: คิดตามปกติ
    rentTotal = room.rent ? room.rent.toNumber() : 0
    commonFeeTotal = room.commonFee ? room.commonFee.toNumber() : 0

    // คำนวณค่าไฟ มิเตอร์ A
    if (
      room.elecRate &&
      data.newElecMeter != null &&
      data.oldElecMeter != null
    ) {
      const usage = Math.max(0, Number(data.newElecMeter) - Number(data.oldElecMeter))
      elecTotal += usage * room.elecRate.toNumber()
    }
    // คำนวณค่าไฟ มิเตอร์ B (กรณี DOUBLE)
    if (
      room.elecMeterType === 'DOUBLE' &&
      room.elecRate &&
      data.newElecMeterB != null &&
      data.oldElecMeterB != null
    ) {
      const usageB = Math.max(0, Number(data.newElecMeterB) - Number(data.oldElecMeterB))
      elecTotal += usageB * room.elecRate.toNumber()
    }

    // คำนวณค่าน้ำ
    if (room.waterMeterType === 'FLAT') {
      waterTotal = room.waterFlatRate ? room.waterFlatRate.toNumber() : 0
    } else if (room.waterMeterType === 'UNIT' || room.waterMeterType === 'PERSON_MIN') {
      if (room.waterRate && data.newWaterMeter != null && data.oldWaterMeter != null) {
        const usage = Math.max(0, Number(data.newWaterMeter) - Number(data.oldWaterMeter))
        waterTotal = usage * room.waterRate.toNumber()

        // กรณีขั้นต่ำต่อคน
        if (room.waterMeterType === 'PERSON_MIN' && room.waterMinCharge) {
          const minCharge = room.waterMinCharge.toNumber() * (room.occupantsCount || 1)
          if (waterTotal < minCharge) {
            waterTotal = minCharge
          }
        }
      }
    }
  }

  const customItemsTotal =
    data.customItems && Array.isArray(data.customItems)
      ? data.customItems.reduce((sum, item) => sum + (parseFloat(String(item.amount)) || 0), 0)
      : 0

  const grandTotal = elecTotal + waterTotal + rentTotal + commonFeeTotal + customItemsTotal

  return { elecTotal, waterTotal, rentTotal, commonFeeTotal, grandTotal }
}

// ─── Query Functions ──────────────────────────────────────────────────────────

export async function getInvoices(roomId: string) {
  return await prisma.invoice.findMany({
    where: { roomId },
    orderBy: [{ billingYear: 'desc' }, { billingMonth: 'desc' }]
  })
}

export async function getAllInvoices() {
  return await prisma.invoice.findMany({
    include: { room: { include: { apartment: true } }, customItems: true },
    orderBy: [{ createdAt: 'desc' }]
  })
}

export async function getInvoice(id: string) {
  return await prisma.invoice.findUnique({
    where: { id },
    include: { room: { include: { apartment: true } }, customItems: true }
  })
}

// ─── Mutation Functions ───────────────────────────────────────────────────────

export async function createInvoice(data: InvoiceInput) {
  const room = await prisma.room.findUnique({ where: { id: data.roomId } })
  if (!room) throw new Error('ไม่พบข้อมูลห้องพัก')

  const { elecTotal, waterTotal, rentTotal, commonFeeTotal, grandTotal } =
    calculateInvoiceTotals(room, data)

  try {
    const invoice = await prisma.invoice.create({
      data: {
        type: data.type || 'REGULAR',
        roomId: data.roomId,
        billingMonth: data.billingMonth,
        billingYear: data.billingYear,
        billDate: new Date(data.billDate),
        checkIn: data.checkIn ? new Date(data.checkIn) : null,
        checkOut: data.checkOut ? new Date(data.checkOut) : null,
        oldElecMeter: data.oldElecMeter ?? null,
        newElecMeter: data.newElecMeter ?? null,
        oldElecMeterB: data.oldElecMeterB ?? null,
        newElecMeterB: data.newElecMeterB ?? null,
        oldWaterMeter: data.oldWaterMeter ?? null,
        newWaterMeter: data.newWaterMeter ?? null,
        note: data.note ?? null,
        elecTotal,
        waterTotal,
        rentTotal,
        commonFeeTotal,
        grandTotal,
        customItems:
          data.customItems && data.customItems.length > 0
            ? {
                create: data.customItems.map((item) => ({
                  name: item.name,
                  amount: parseFloat(String(item.amount)) || 0
                }))
              }
            : undefined
      }
    })

    revalidatePath(`/rooms/${data.roomId}`)
    revalidatePath('/reports')
    return invoice
  } catch (error) {
    console.error('[createInvoice]', error)
    throw new Error('เกิดข้อผิดพลาดในการสร้างบิล กรุณาลองใหม่อีกครั้ง')
  }
}

export async function updateInvoice(id: string, data: Partial<{ isPaid: boolean; note: string }>) {
  // ใช้สำหรับอัปเดตสถานะ isPaid หรือหมายเหตุเท่านั้น
  // หากต้องการแก้เลขมิเตอร์ ให้ใช้ updateInvoiceDetails แทน
  try {
    const invoice = await prisma.invoice.update({ where: { id }, data })
    revalidatePath(`/invoices/${id}`)
    revalidatePath('/reports')
    return invoice
  } catch (error) {
    console.error('[updateInvoice]', error)
    throw new Error('เกิดข้อผิดพลาดในการอัปเดตบิล กรุณาลองใหม่อีกครั้ง')
  }
}

export async function deleteInvoice(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id } })
    if (invoice) {
      await prisma.invoice.delete({ where: { id } })
      revalidatePath(`/rooms/${invoice.roomId}`)
      revalidatePath(`/invoices`)
      revalidatePath('/reports')
    }
  } catch (error) {
    console.error('[deleteInvoice]', error)
    throw new Error('เกิดข้อผิดพลาดในการลบบิล กรุณาลองใหม่อีกครั้ง')
  }
}

export async function updateInvoiceDetails(id: string, data: InvoiceInput) {
  // ดึงข้อมูลห้อง + คำนวณใหม่ทุกครั้งเมื่อแก้เลขมิเตอร์
  const room = await prisma.room.findUnique({ where: { id: data.roomId } })
  if (!room) throw new Error('ไม่พบข้อมูลห้องพัก')

  const { elecTotal, waterTotal, rentTotal, commonFeeTotal, grandTotal } =
    calculateInvoiceTotals(room, data)

  try {
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        type: data.type || 'REGULAR',
        billingMonth: data.billingMonth,
        billingYear: data.billingYear,
        billDate: new Date(data.billDate),
        checkIn: data.checkIn ? new Date(data.checkIn) : null,
        checkOut: data.checkOut ? new Date(data.checkOut) : null,
        oldElecMeter: data.oldElecMeter ?? null,
        newElecMeter: data.newElecMeter ?? null,
        oldElecMeterB: data.oldElecMeterB ?? null,
        newElecMeterB: data.newElecMeterB ?? null,
        oldWaterMeter: data.oldWaterMeter ?? null,
        newWaterMeter: data.newWaterMeter ?? null,
        note: data.note ?? null,
        elecTotal,
        waterTotal,
        rentTotal,
        commonFeeTotal,
        grandTotal,
        customItems: {
          deleteMany: {},
          create: data.customItems
            ? data.customItems.map((item) => ({
                name: item.name,
                amount: parseFloat(String(item.amount)) || 0
              }))
            : []
        }
      }
    })

    revalidatePath(`/rooms/${data.roomId}`)
    revalidatePath(`/invoices/${id}`)
    revalidatePath('/reports')
    return invoice
  } catch (error) {
    console.error('[updateInvoiceDetails]', error)
    throw new Error('เกิดข้อผิดพลาดในการแก้ไขบิล กรุณาลองใหม่อีกครั้ง')
  }
}

