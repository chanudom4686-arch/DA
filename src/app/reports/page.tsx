import { getMonthlyReport } from '@/actions/report'
import Link from 'next/link'
import PrintButton from '@/components/PrintButton'
import { getOverdueDays } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BarChart3, CheckCircle2, AlertTriangle, Eye, FileSpreadsheet } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ month?: string, year?: string }> }) {
  const params = await searchParams
  
  const currentDate = new Date()
  const month = params.month ? parseInt(params.month) : currentDate.getMonth() + 1
  const year = params.year ? parseInt(params.year) : currentDate.getFullYear()

  const report = await getMonthlyReport(month, year)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border no-print">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            รายงานสรุปรายรับ
          </h1>
          <p className="text-muted-foreground text-sm">สรุปยอดบิลและสถานะการชำระเงินประจำเดือน</p>
        </div>
        <PrintButton />
      </div>

      <Card className="no-print border-purple-100 dark:border-purple-900/50 shadow-sm">
        <CardContent className="p-6">
          <form className="flex flex-col sm:flex-row items-end gap-4">
            <div className="w-full sm:w-1/3 space-y-2">
              <Label htmlFor="month">เดือน</Label>
              <div className="relative">
                <select 
                  name="month" 
                  id="month"
                  defaultValue={month} 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={i+1}>เดือน {i+1}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="w-full sm:w-1/3 space-y-2">
              <Label htmlFor="year">ปี (ค.ศ.)</Label>
              <Input type="number" id="year" name="year" defaultValue={year} />
            </div>
            <div className="w-full sm:w-1/3">
              <Button type="submit" className="w-full gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                ดูรายงาน
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="print-header hidden mb-8 text-center print:block">
        <h2 className="text-2xl font-bold">รายงานสรุปรายรับ ประจำเดือน {month}/{year}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-900">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-purple-700 dark:text-purple-400">ยอดเรียกเก็บทั้งหมด</h3>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-300 mt-2">
              {report.summary.grandTotal.toLocaleString()} <span className="text-lg font-normal">บ.</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-green-700 dark:text-green-400">เก็บเงินแล้ว</h3>
            <p className="text-3xl font-bold text-green-900 dark:text-green-300 mt-2">
              {report.summary.collected.toLocaleString()} <span className="text-lg font-normal">บ.</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-red-700 dark:text-red-400">ค้างชำระ</h3>
            <p className="text-3xl font-bold text-red-900 dark:text-red-300 mt-2">
              {report.summary.uncollected.toLocaleString()} <span className="text-lg font-normal">บ.</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">จำนวนบิล</h3>
            <p className="text-3xl font-bold mt-2">
              {report.invoices.length} <span className="text-lg font-normal">ใบ</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left print:border print:border-gray-300">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border print:bg-gray-100">
              <tr>
                <th className="font-medium py-3 px-4 print:border print:border-gray-300">ห้องพัก</th>
                <th className="font-medium py-3 px-4 print:border print:border-gray-300">ผู้เช่า</th>
                <th className="font-medium py-3 px-4 text-right print:border print:border-gray-300">ค่าเช่า</th>
                <th className="font-medium py-3 px-4 text-right print:border print:border-gray-300">น้ำ+ไฟ</th>
                <th className="font-medium py-3 px-4 text-right print:border print:border-gray-300">อื่นๆ</th>
                <th className="font-medium py-3 px-4 text-right print:border print:border-gray-300">ยอดรวม</th>
                <th className="font-medium py-3 px-4 text-center print:border print:border-gray-300">สถานะ</th>
                <th className="font-medium py-3 px-4 text-center no-print">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {report.invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 print:border print:border-gray-300">
                    <strong className="font-medium">{inv.room.name}</strong>
                    <br/>
                    <span className="text-xs text-muted-foreground">{inv.room.apartment.name}</span>
                  </td>
                  <td className="py-3 px-4 print:border print:border-gray-300">{inv.room.tenantName || '-'}</td>
                  <td className="py-3 px-4 text-right print:border print:border-gray-300">
                    {inv.rentTotal.toNumber().toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right print:border print:border-gray-300">
                    {(inv.waterTotal.toNumber() + inv.elecTotal.toNumber()).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right print:border print:border-gray-300">
                    {inv.customItems ? inv.customItems.reduce((s: number, i: any) => s + i.amount.toNumber(), 0).toLocaleString() : '0'}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold print:border print:border-gray-300">
                    {inv.grandTotal.toNumber().toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center print:border print:border-gray-300">
                    <div className="flex flex-col gap-1 items-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center justify-center gap-1
                        ${inv.isPaid ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
                      >
                        {inv.isPaid ? 'จ่ายแล้ว' : 'ค้างชำระ'}
                      </span>
                      {!inv.isPaid && getOverdueDays(inv.billDate, inv.room.paymentDate) > 0 && (
                        <span className="text-[10px] text-red-500 font-bold">
                          เลยกำหนด {getOverdueDays(inv.billDate, inv.room.paymentDate)} วัน
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center no-print">
                    <Link href={`/invoices/${inv.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                        <Eye className="w-3 h-3" />
                        ดูบิล
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {report.invoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground print:border print:border-gray-300">
                    ไม่มีข้อมูลบิลในเดือนนี้
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
