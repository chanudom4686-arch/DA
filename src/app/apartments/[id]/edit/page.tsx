import ApartmentForm from '@/components/ApartmentForm'
import { getApartment } from '@/actions/apartment'
import { notFound } from 'next/navigation'

export default async function EditApartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const apt = await getApartment(id)

  if (!apt) {
    notFound()
  }

  return (
    <div>
      <div className="header">
        <div>
          <h1 className="title">แก้ไขหอพัก: {apt.name}</h1>
          <p className="subtitle">ปรับปรุงข้อมูลหอพักและการรับชำระเงิน</p>
        </div>
      </div>
      <ApartmentForm initialData={apt} />
    </div>
  )
}
