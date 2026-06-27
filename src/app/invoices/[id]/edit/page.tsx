import { getInvoice } from '@/actions/invoice'
import { notFound } from 'next/navigation'
import InvoiceForm from '@/components/InvoiceForm'

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getInvoice(id)
  
  if (!invoice) notFound()

  return (
    <div>
      <div className="header">
        <div>
          <h1 className="title">แก้ไขบิล / Invoice</h1>
          <p className="subtitle">ห้อง {invoice.room.name} (INV-{invoice.billingYear}{invoice.billingMonth.toString().padStart(2, '0')}-{invoice.room.name})</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <InvoiceForm 
          roomId={invoice.roomId} 
          roomData={invoice.room} 
          invoiceData={invoice} 
        />
      </div>
    </div>
  )
}
