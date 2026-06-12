'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteInvoice, updateInvoice } from '@/actions/invoice'

export default function InvoiceActions({ invoiceId, isPaid }: { invoiceId: string, isPaid: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleToggleStatus = async () => {
    setLoading(true)
    try {
      await updateInvoice(invoiceId, { isPaid: !isPaid })
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบิลนี้? การลบจะไม่สามารถกู้คืนได้')) {
      setLoading(true)
      try {
        await deleteInvoice(invoiceId)
        router.push('/invoices') // กลับไปหน้ารวมบิล
        router.refresh()
      } catch (error) {
        console.error(error)
        alert('เกิดข้อผิดพลาดในการลบบิล')
        setLoading(false)
      }
    }
  }

  return (
    <div className="no-print" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <button 
        onClick={handleToggleStatus} 
        disabled={loading}
        className={`btn ${isPaid ? 'btn-outline' : 'btn-primary'}`}
        style={{ 
          backgroundColor: isPaid ? '#fee2e2' : '#dcfce7', 
          color: isPaid ? '#991b1b' : '#166534',
          borderColor: isPaid ? '#fca5a5' : '#86efac'
        }}
      >
        {isPaid ? '❌ เปลี่ยนเป็นค้างชำระ' : '✅ ทำเครื่องหมายว่า จ่ายแล้ว'}
      </button>

      <Link href={`/invoices/${invoiceId}/edit`} className="btn btn-outline">
        ✏️ แก้ไขบิล
      </Link>

      <button onClick={handleDelete} disabled={loading} className="btn btn-outline" style={{ color: 'red', borderColor: 'red' }}>
        🗑️ ลบ
      </button>
    </div>
  )
}
