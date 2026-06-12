'use server'

import { prisma } from '@/lib/db'

export async function getMonthlyReport(month: number, year: number) {
  const invoices = await prisma.invoice.findMany({
    where: {
      billingMonth: month,
      billingYear: year
    },
    include: {
      room: {
        include: {
          apartment: true
        }
      }
    },
    orderBy: {
      room: {
        name: 'asc'
      }
    }
  })

  let totalRent = 0
  let totalElec = 0
  let totalWater = 0
  let totalCommonFee = 0
  let grandTotal = 0
  let collected = 0

  invoices.forEach(inv => {
    totalRent += inv.rentTotal
    totalElec += inv.elecTotal
    totalWater += inv.waterTotal
    totalCommonFee += inv.commonFeeTotal
    grandTotal += inv.grandTotal
    if (inv.isPaid) {
      collected += inv.grandTotal
    }
  })

  return {
    invoices,
    summary: {
      totalRent,
      totalElec,
      totalWater,
      totalCommonFee,
      grandTotal,
      collected,
      uncollected: grandTotal - collected
    }
  }
}
