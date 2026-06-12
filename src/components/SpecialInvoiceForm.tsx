'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createInvoice } from '@/actions/invoice'

export default function SpecialInvoiceForm({ roomId }: { roomId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const [formData, setFormData] = useState({
    billingMonth: currentMonth,
    billingYear: currentYear,
    billDate: new Date().toISOString().substring(0, 10),
    note: ''
  })

  const [customItems, setCustomItems] = useState<{name: string, amount: number}[]>([
    { name: '', amount: 0 }
  ])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAddCustomItem = () => {
    setCustomItems([...customItems, { name: '', amount: 0 }])
  }

  const handleCustomItemChange = (index: number, field: string, value: any) => {
    const newItems = [...customItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setCustomItems(newItems)
  }

  const handleRemoveCustomItem = (index: number) => {
    setCustomItems(customItems.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (customItems.length === 0) {
      alert('กรุณาเพิ่มรายการอย่างน้อย 1 รายการ')
      return
    }

    setLoading(true)
    try {
      const payload = {
        roomId,
        type: 'SPECIAL',
        billingMonth: parseInt(formData.billingMonth.toString()),
        billingYear: parseInt(formData.billingYear.toString()),
        billDate: new Date(formData.billDate),
        note: formData.note,
        customItems,
        // Zero out normal fields
        elecTotal: 0,
        waterTotal: 0,
        rentTotal: 0,
        commonFeeTotal: 0,
      }
      
      await createInvoice(payload)
      router.push(`/rooms/${roomId}`)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('เกิดข้อผิดพลาดในการสร้างบิลพิเศษ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="grid grid-cols-2">
        <div>
          <label className="label">ประจำเดือน (สำหรับการอ้างอิง)</label>
          <select name="billingMonth" value={formData.billingMonth} onChange={handleChange} className="input">
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>เดือน {i+1}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">ปี (ค.ศ.)</label>
          <input type="number" name="billingYear" value={formData.billingYear} onChange={handleChange} className="input" required />
        </div>
        
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label">วันที่ออกบิล</label>
          <input type="date" name="billDate" value={formData.billDate} onChange={handleChange} className="input" required />
        </div>

        <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--primary-color)', margin: 0 }}>รายการบิลพิเศษ</h3>
            <button type="button" onClick={handleAddCustomItem} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
              + เพิ่มรายการ
            </button>
          </div>
          
          {customItems.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 2 }}>
                <input type="text" placeholder="ชื่อรายการ (เช่น ค่าปรับ)" value={item.name} onChange={(e) => handleCustomItemChange(index, 'name', e.target.value)} className="input" required />
              </div>
              <div style={{ flex: 1 }}>
                <input type="number" placeholder="จำนวนเงิน" value={item.amount || ''} onChange={(e) => handleCustomItemChange(index, 'amount', parseFloat(e.target.value) || 0)} className="input" required />
              </div>
              <button type="button" onClick={() => handleRemoveCustomItem(index)} className="btn" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.5rem 0.75rem', border: 'none' }}>ลบ</button>
            </div>
          ))}
          {customItems.length === 0 && (
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>ไม่มีรายการ</p>
          )}
        </div>

        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
          <label className="label">หมายเหตุในบิล (ถ้ามี)</label>
          <textarea name="note" value={formData.note} onChange={handleChange} className="input" rows={2} />
        </div>
      </div>
      
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button type="button" onClick={() => router.back()} className="btn btn-outline">ยกเลิก</button>
        <button type="submit" disabled={loading || customItems.length === 0} className="btn btn-primary" style={{ backgroundColor: '#d946ef', color: 'white' }}>
          {loading ? 'กำลังสร้าง...' : 'สร้างบิลพิเศษ'}
        </button>
      </div>
    </form>
  )
}
