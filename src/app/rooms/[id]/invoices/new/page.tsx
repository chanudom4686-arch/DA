import { getRoom } from '@/actions/room'
import { getInvoices } from '@/actions/invoice'
import InvoiceForm from '@/components/InvoiceForm'
import { notFound } from 'next/navigation'

export default async function NewInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = await getRoom(id)
  
  if (!room) notFound()

  // Get last invoice to prepopulate old meters
  const invoices = await getInvoices(id)
  const lastInvoice = invoices[0] || null

  return (
    <div>
      <div className="header">
        <div>
          <h1 className="title">ออกบิลใหม่: ห้อง {room.name}</h1>
          <p className="subtitle">กรอกเลขมิเตอร์เพื่อคำนวณค่าใช้จ่าย</p>
        </div>
      </div>
      <InvoiceForm roomId={room.id} roomData={room} lastInvoice={lastInvoice} />
    </div>
  )
}
