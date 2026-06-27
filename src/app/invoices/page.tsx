import { getAllInvoices } from '@/actions/invoice'
import Link from 'next/link'
import { getOverdueDays } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, CheckCircle2, AlertTriangle, Eye } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function InvoicesIndexPage() {
  const invoices = await getAllInvoices()

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            บิลทั้งหมด (All Invoices)
          </h1>
          <p className="text-muted-foreground text-sm">ประวัติบิลค่าเช่าและบิลพิเศษทั้งหมดในระบบ</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="font-medium py-3 px-4">รอบบิล</th>
                <th className="font-medium py-3 px-4">วันที่ออกบิล</th>
                <th className="font-medium py-3 px-4">หอพัก</th>
                <th className="font-medium py-3 px-4">ห้อง</th>
                <th className="font-medium py-3 px-4 text-right">ยอดรวม (บาท)</th>
                <th className="font-medium py-3 px-4">สถานะ</th>
                <th className="font-medium py-3 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium">{inv.billingMonth}/{inv.billingYear}</td>
                  <td className="py-3 px-4 text-muted-foreground">{inv.billDate.toLocaleDateString('th-TH')}</td>
                  <td className="py-3 px-4">{inv.room.apartment.name}</td>
                  <td className="py-3 px-4">
                    {inv.room.name} {inv.room.isDaily ? <span className="text-xs text-purple-500 ml-1">(รายวัน)</span> : ''}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    {inv.grandTotal.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1
                        ${inv.isPaid ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
                      >
                        {inv.isPaid ? <CheckCircle2 className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3"/>}
                        {inv.isPaid ? 'จ่ายแล้ว' : 'ค้างชำระ'}
                      </span>
                      {!inv.isPaid && getOverdueDays(inv.billDate, inv.room.paymentDate) > 0 && (
                        <span className="text-[10px] text-red-500 font-bold ml-1">
                          เลยกำหนด {getOverdueDays(inv.billDate, inv.room.paymentDate)} วัน
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link href={`/invoices/${inv.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                        <Eye className="w-3 h-3" />
                        ดูบิล
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    ยังไม่มีบิลในระบบ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
