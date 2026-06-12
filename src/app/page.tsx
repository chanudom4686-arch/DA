import { getApartments } from '@/actions/apartment'
import Link from 'next/link'
import { PlusCircle, Building2, UserCircle, Phone, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const apartments = await getApartments()

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">ภาพรวมระบบ (Dashboard)</h1>
          <p className="text-muted-foreground mt-1">ยินดีต้อนรับสู่ระบบจัดการหอพัก เลือกระบบที่คุณต้องการจัดการ</p>
        </div>
        <Link href="/apartments/new">
          <Button className="w-full sm:w-auto gap-2">
            <PlusCircle className="w-4 h-4" />
            เพิ่มหอพักใหม่
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apartments.map((apt) => (
          <Link key={apt.id} href={`/apartments/${apt.id}`} className="group h-full">
            <Card className="h-full transition-all duration-300 hover:shadow-md hover:border-primary/50 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl group-hover:text-primary transition-colors">
                  <Building2 className="w-5 h-5 text-primary" />
                  {apt.name}
                </CardTitle>
                <CardDescription className="line-clamp-1">{apt.address || 'ไม่มีข้อมูลที่อยู่'}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserCircle className="w-4 h-4 shrink-0" />
                  <span className="truncate">ผู้ดูแล: {apt.ownerName || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>เบอร์โทร: {apt.ownerPhone || '-'}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-border/50">
                <div className="flex w-full items-center justify-between text-sm font-medium text-primary">
                  <span>จัดการห้องพัก</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}

        {apartments.length === 0 && (
          <div className="col-span-full">
            <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center bg-muted/30">
              <Building2 className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">ยังไม่มีข้อมูลหอพัก</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">เริ่มต้นการจัดการโดยการเพิ่มหอพักแรกของคุณ</p>
              <Link href="/apartments/new">
                <Button variant="outline" className="gap-2">
                  <PlusCircle className="w-4 h-4" />
                  เพิ่มหอพัก
                </Button>
              </Link>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
