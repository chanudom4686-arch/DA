import { getApartment, getApartments } from '@/actions/apartment'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ApartmentSwitcher from '@/components/ApartmentSwitcher'
import { getOverdueDays } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, Edit, Plus, UserCircle, Phone, MapPin, Building, CreditCard, ArrowRight, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ApartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const apt = await getApartment(id)
  
  if (!apt) {
    notFound()
  }

  const allApts = await getApartments()

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const monthlyRooms = apt.rooms.filter(r => !r.isDaily)
  const dailyRooms = apt.rooms.filter(r => r.isDaily)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
        <div className="space-y-2">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">{apt.name}</h1>
            <ApartmentSwitcher apartments={allApts} currentId={apt.id} />
          </div>
          <p className="text-muted-foreground">ข้อมูลหอพักและห้องพักทั้งหมดในสาขานี้</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/apartments/${apt.id}/fast-billing`}>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
              <Zap className="w-4 h-4" />
              จดบิลด่วน
            </Button>
          </Link>
          <Link href={`/apartments/${apt.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" />
              แก้ไขข้อมูล
            </Button>
          </Link>
          <Link href={`/apartments/${apt.id}/rooms/new`}>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              เพิ่มห้องพัก
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Building className="w-5 h-5" />
              ข้อมูลติดต่อหอพัก
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <UserCircle className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="font-medium w-16">ผู้ดูแล:</span>
              <span className="text-muted-foreground">{apt.ownerName || '-'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="font-medium w-16">เบอร์โทร:</span>
              <span className="text-muted-foreground">{apt.ownerPhone || '-'}</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="font-medium w-16 shrink-0">ที่อยู่:</span>
              <span className="text-muted-foreground">{apt.address || '-'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              ข้อมูลรับชำระเงิน
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium w-20 shrink-0 text-muted-foreground">ธนาคาร:</span>
              <span>{apt.bankName || '-'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium w-20 shrink-0 text-muted-foreground">ชื่อบัญชี:</span>
              <span>{apt.bankAccountName || '-'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium w-20 shrink-0 text-muted-foreground">เลขบัญชี:</span>
              <span className="font-mono bg-muted px-2 py-0.5 rounded">{apt.bankAccountNumber || '-'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            ห้องพักรายเดือน
            <span className="ml-3 inline-flex items-center justify-center bg-primary/10 text-primary text-sm rounded-full px-3 py-1">
              {monthlyRooms.length} ห้อง
            </span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {monthlyRooms.map((room) => {
            const hasCurrentMonthBill = room.invoices?.some((i: any) => i.billingMonth === currentMonth && i.billingYear === currentYear)
            const overdueInvoices = room.invoices?.filter((i: any) => !i.isPaid && getOverdueDays(i.billDate, room.paymentDate) > 0)
            const isOverdue = overdueInvoices && overdueInvoices.length > 0

            return (
              <Link key={room.id} href={`/rooms/${room.id}`} className="group">
                <Card className={`h-full transition-all hover:shadow-md ${isOverdue ? 'border-destructive/50 hover:border-destructive' : 'hover:border-primary/40'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        ห้อง {room.name}
                      </CardTitle>
                      <div className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1
                        ${isOverdue ? 'bg-destructive/10 text-destructive' : 
                          (room.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300')}`}
                      >
                        {isOverdue ? (
                          <><AlertTriangle className="w-3 h-3" /> ค้างชำระ</>
                        ) : (
                          room.status === 'AVAILABLE' ? 'ว่าง' : 'ไม่ว่าง'
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ค่าเช่า</span>
                        <span className="font-medium">{room.rent?.toString() || 0} บ.</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        <span className="text-muted-foreground">สถานะบิลเดือนนี้</span>
                        <span className={`font-semibold text-xs ${hasCurrentMonthBill ? 'text-green-600 dark:text-green-500' : 'text-orange-500'}`}>
                          {hasCurrentMonthBill ? '✅ ออกบิลแล้ว' : '⏳ รอออกบิล'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
          {monthlyRooms.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
              ไม่มีห้องพักรายเดือนในหอพักนี้
            </div>
          )}
        </div>
      </div>

      <div className="pt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-purple-700 dark:text-purple-400">
            ห้องพักรายวัน
            <span className="ml-3 inline-flex items-center justify-center bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-sm rounded-full px-3 py-1">
              {dailyRooms.length} ห้อง
            </span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dailyRooms.map((room) => (
            <Link key={room.id} href={`/rooms/${room.id}`} className="group">
              <Card className="h-full border-l-4 border-l-purple-500 hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl text-purple-700 dark:text-purple-400 group-hover:text-purple-600 transition-colors">
                      ห้อง {room.name}
                    </CardTitle>
                    <div className={`text-xs px-2.5 py-0.5 rounded-full font-medium 
                      ${room.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
                    >
                      {room.status === 'AVAILABLE' ? 'ว่าง' : 'ไม่ว่าง'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>เรทค่าเช่า</span>
                    <span className="font-medium text-foreground">{room.rent?.toString() || 0} บ./วัน</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {dailyRooms.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
              ไม่มีห้องพักรายวันในหอพักนี้
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
