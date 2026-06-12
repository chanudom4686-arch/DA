import { getApartment, getRoomsForFastBilling } from '@/actions/apartment'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import FastBillingView from '@/components/FastBillingView'

export default async function FastBillingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const apt = await getApartment(id)
  
  if (!apt) notFound()

  const rooms = await getRoomsForFastBilling(id)

  return (
    <div>
      <div className="header" style={{ marginBottom: '1rem' }}>
        <div>
          <h1 className="title">⚡ จดบิลด่วน (Fast Billing)</h1>
          <p className="subtitle">หอพัก {apt.name}</p>
        </div>
        <div>
          <Link href={`/apartments/${apt.id}`} className="btn btn-outline">
            &larr; กลับไปหน้าหอพัก
          </Link>
        </div>
      </div>

      <FastBillingView rooms={rooms} />
    </div>
  )
}
