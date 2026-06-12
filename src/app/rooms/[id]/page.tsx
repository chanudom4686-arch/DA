import { getRoom } from '@/actions/room'
import { getInvoices } from '@/actions/invoice'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOverdueDays } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge' // Wait, I didn't install badge. I'll use raw spans.
import { ArrowLeft, Edit, Plus, FileText, UserCircle, Wallet, Settings2, AlertTriangle, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = await getRoom(id)
  if (!room) notFound()

  const invoices = await getInvoices(id)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">ห้อง {room.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
              ${room.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
            >
              {room.status === 'AVAILABLE' ? 'ว่าง' : 'ไม่ว่าง'}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">ข้อมูลผู้เช่า ค่าใช้จ่าย และประวัติบิล</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/apartments/${room.apartmentId}`}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              กลับไปหอพัก
            </Button>
          </Link>
          <Link href={`/rooms/${room.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Settings2 className="w-4 h-4" />
              การตั้งค่าห้อง
            </Button>
          </Link>
          <Link href={`/rooms/${room.id}/special-invoice`}>
            <Button variant="outline" className="gap-2 border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20">
              <FileText className="w-4 h-4" />
              ออกบิลพิเศษ
            </Button>
          </Link>
          <Link href={`/rooms/${room.id}/invoices/new`}>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              ออกบิลใหม่
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <UserCircle className="w-5 h-5" />
              ข้อมูลผู้เช่า
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">ชื่อ:</span>
              <span className="font-medium">{room.tenantName || '-'}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-muted-foreground">เบอร์โทร:</span>
              <span className="font-medium">{room.tenantPhone || '-'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Wallet className="w-5 h-5" />
              ค่าใช้จ่ายประจำ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">ค่าเช่า:</span>
              <span className="font-medium">{room.rent?.toString() || 0} บาท</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-muted-foreground">ค่าส่วนกลาง:</span>
              <span className="font-medium">{room.commonFee?.toString() || 0} บาท</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Settings2 className="w-5 h-5" />
              ตั้งค่ามิเตอร์
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">ไฟ ({room.elecMeterType}):</span>
              <span className="font-medium">{room.elecRate?.toString() || 0} บ./หน่วย</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-muted-foreground">น้ำ ({room.waterMeterType}):</span>
              <span className="font-medium">
                {room.waterMeterType === 'FLAT' 
                  ? `${room.waterFlatRate?.toString() || 0} บ.` 
                  : `${room.waterRate?.toString() || 0} บ./หน่วย`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold tracking-tight mb-4">ประวัติบิลค่าเช่า</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="font-medium py-3 px-4">รอบบิล</th>
                  <th className="font-medium py-3 px-4">วันที่ออกบิล</th>
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
                    <td className="py-3 px-4 text-right font-medium">{inv.grandTotal.toNumber().toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1
                          ${inv.isPaid ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
                        >
                          {inv.isPaid ? <CheckCircle2 className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3"/>}
                          {inv.isPaid ? 'จ่ายแล้ว' : 'ค้างชำระ'}
                        </span>
                        {!inv.isPaid && getOverdueDays(inv.billDate, room.paymentDate) > 0 && (
                          <span className="text-[10px] text-red-500 font-bold ml-1">
                            เลยกำหนด {getOverdueDays(inv.billDate, room.paymentDate)} วัน
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link href={`/invoices/${inv.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          ดูบิล
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      ยังไม่มีประวัติบิล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
