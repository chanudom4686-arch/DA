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
      },
      customItems: true
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
  let totalSpecial = 0
  let grandTotal = 0
  let collected = 0

  invoices.forEach(inv => {
    totalRent += inv.rentTotal.toNumber()
    totalElec += inv.elecTotal.toNumber()
    totalWater += inv.waterTotal.toNumber()
    totalCommonFee += inv.commonFeeTotal.toNumber()
    
    let special = 0
    if (inv.customItems) {
      special = inv.customItems.reduce((sum: number, item: any) => sum + item.amount.toNumber(), 0)
    }
    totalSpecial += special
    
    grandTotal += inv.grandTotal.toNumber()
    if (inv.isPaid) {
      collected += inv.grandTotal.toNumber()
    }
  })

  return {
    invoices,
    summary: {
      totalRent,
      totalElec,
      totalWater,
      totalCommonFee,
      totalSpecial,
      grandTotal,
      collected,
      uncollected: grandTotal - collected
    }
  }
}
