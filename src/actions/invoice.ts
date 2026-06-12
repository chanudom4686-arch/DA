'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getInvoices(roomId: string) {
  return await prisma.invoice.findMany({
    where: { roomId },
    orderBy: [{ billingYear: 'desc' }, { billingMonth: 'desc' }]
  })
}

export async function getAllInvoices() {
  return await prisma.invoice.findMany({
    include: { room: { include: { apartment: true } } },
    orderBy: [{ createdAt: 'desc' }]
  })
}

export async function getInvoice(id: string) {
  return await prisma.invoice.findUnique({
    where: { id },
    include: { room: { include: { apartment: true } } }
  })
}

export async function createInvoice(data: any) {
  // ดึงข้อมูลห้องเพื่อคำนวณ
  const room = await prisma.room.findUnique({ where: { id: data.roomId } })
  if (!room) throw new Error('Room not found')

  let elecTotal = 0
  let waterTotal = 0
  let rentTotal = 0
  let commonFeeTotal = 0

  if (room.isDaily) {
    // ห้องรายวัน คิดแค่ค่าเช่าที่กรอกมา
    rentTotal = data.rentTotal !== undefined ? parseFloat(data.rentTotal) : (room.rent || 0)
  } else {
    // ห้องรายเดือน คิดตามปกติ
    rentTotal = room.rent || 0
    commonFeeTotal = room.commonFee || 0

    if (room.elecRate && data.newElecMeter !== undefined && data.oldElecMeter !== undefined) {
      const usage = Math.max(0, data.newElecMeter - data.oldElecMeter)
      elecTotal += usage * room.elecRate
    }
    if (room.elecMeterType === 'DOUBLE' && room.elecRate && data.newElecMeterB !== undefined && data.oldElecMeterB !== undefined) {
      const usageB = Math.max(0, data.newElecMeterB - data.oldElecMeterB)
      elecTotal += usageB * room.elecRate
    }

    if (room.waterMeterType === 'FLAT') {
      waterTotal = room.waterFlatRate || 0
    } else if (room.waterMeterType === 'UNIT' || room.waterMeterType === 'PERSON_MIN') {
      if (room.waterRate && data.newWaterMeter !== undefined && data.oldWaterMeter !== undefined) {
        const usage = Math.max(0, data.newWaterMeter - data.oldWaterMeter)
        waterTotal = usage * room.waterRate
        
        if (room.waterMeterType === 'PERSON_MIN' && room.waterMinCharge) {
          const minCharge = room.waterMinCharge * (room.occupantsCount || 1)
          if (waterTotal < minCharge) {
            waterTotal = minCharge
          }
        }
      }
    }
  }

  const grandTotal = elecTotal + waterTotal + rentTotal + commonFeeTotal

  const invoice = await prisma.invoice.create({
    data: {
      roomId: data.roomId,
      billingMonth: data.billingMonth,
      billingYear: data.billingYear,
      billDate: data.billDate,
      checkIn: data.checkIn ? new Date(data.checkIn) : null,
      checkOut: data.checkOut ? new Date(data.checkOut) : null,
      oldElecMeter: data.oldElecMeter,
      newElecMeter: data.newElecMeter,
      oldElecMeterB: data.oldElecMeterB,
      newElecMeterB: data.newElecMeterB,
      oldWaterMeter: data.oldWaterMeter,
      newWaterMeter: data.newWaterMeter,
      note: data.note,
      elecTotal,
      waterTotal,
      rentTotal,
      commonFeeTotal,
      grandTotal,
    }
  })
  
  revalidatePath(`/rooms/${data.roomId}`)
  revalidatePath('/reports')
  return invoice
}

export async function updateInvoice(id: string, data: any) {
  // หากต้องการคำนวณใหม่เมื่ออัปเดตเลขมิเตอร์ ให้ดึง logic แบบเดียวกับ createInvoice
  // แต่เบื้องต้นรองรับการอัปเดตสถานะ isPaid
  const invoice = await prisma.invoice.update({
    where: { id },
    data
  })
  revalidatePath(`/invoices/${id}`)
  revalidatePath('/reports')
  return invoice
}
export async function deleteInvoice(id: string) {
  const invoice = await prisma.invoice.findUnique({ where: { id } })
  if (invoice) {
    await prisma.invoice.delete({ where: { id } })
    revalidatePath(`/rooms/${invoice.roomId}`)
    revalidatePath(`/invoices`)
    revalidatePath('/reports')
  }
}

export async function updateInvoiceDetails(id: string, data: any) {
  const room = await prisma.room.findUnique({ where: { id: data.roomId } })
  if (!room) throw new Error('Room not found')

  let elecTotal = 0
  let waterTotal = 0
  let rentTotal = 0
  let commonFeeTotal = 0

  if (room.isDaily) {
    rentTotal = data.rentTotal !== undefined ? parseFloat(data.rentTotal) : (room.rent || 0)
  } else {
    rentTotal = room.rent || 0
    commonFeeTotal = room.commonFee || 0

    if (room.elecRate && data.newElecMeter !== undefined && data.oldElecMeter !== undefined) {
      const usage = Math.max(0, data.newElecMeter - data.oldElecMeter)
      elecTotal += usage * room.elecRate
    }
    if (room.elecMeterType === 'DOUBLE' && room.elecRate && data.newElecMeterB !== undefined && data.oldElecMeterB !== undefined) {
      const usageB = Math.max(0, data.newElecMeterB - data.oldElecMeterB)
      elecTotal += usageB * room.elecRate
    }

    if (room.waterMeterType === 'FLAT') {
      waterTotal = room.waterFlatRate || 0
    } else if (room.waterMeterType === 'UNIT' || room.waterMeterType === 'PERSON_MIN') {
      if (room.waterRate && data.newWaterMeter !== undefined && data.oldWaterMeter !== undefined) {
        const usage = Math.max(0, data.newWaterMeter - data.oldWaterMeter)
        waterTotal = usage * room.waterRate
        
        if (room.waterMeterType === 'PERSON_MIN' && room.waterMinCharge) {
          const minCharge = room.waterMinCharge * (room.occupantsCount || 1)
          if (waterTotal < minCharge) {
            waterTotal = minCharge
          }
        }
      }
    }
  }

  const grandTotal = elecTotal + waterTotal + rentTotal + commonFeeTotal

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      billingMonth: data.billingMonth,
      billingYear: data.billingYear,
      billDate: data.billDate,
      checkIn: data.checkIn ? new Date(data.checkIn) : null,
      checkOut: data.checkOut ? new Date(data.checkOut) : null,
      oldElecMeter: data.oldElecMeter,
      newElecMeter: data.newElecMeter,
      oldElecMeterB: data.oldElecMeterB,
      newElecMeterB: data.newElecMeterB,
      oldWaterMeter: data.oldWaterMeter,
      newWaterMeter: data.newWaterMeter,
      note: data.note,
      elecTotal,
      waterTotal,
      rentTotal,
      commonFeeTotal,
      grandTotal,
    }
  })
  
  revalidatePath(`/rooms/${data.roomId}`)
  revalidatePath(`/invoices/${id}`)
  revalidatePath('/reports')
  return invoice
}
