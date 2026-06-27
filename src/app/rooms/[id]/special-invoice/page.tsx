import { getRoom } from '@/actions/room'
import { notFound } from 'next/navigation'
import SpecialInvoiceForm from '@/components/SpecialInvoiceForm'

export const dynamic = 'force-dynamic'

export default async function SpecialInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = await getRoom(id)

  if (!room) notFound()

  return (
    <div>
      <div className="header">
        <div>
          <h1 className="title">ออกบิลพิเศษ (Special Invoice)</h1>
          <p className="subtitle">ห้อง {room.name}</p>
        </div>
      </div>

      <SpecialInvoiceForm roomId={room.id} />
    </div>
  )
}
