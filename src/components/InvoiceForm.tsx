'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createInvoice, updateInvoiceDetails } from '@/actions/invoice'
import LoadingOverlay from './LoadingOverlay'

export default function InvoiceForm({ roomId, roomData, lastInvoice, invoiceData }: { roomId: string, roomData: any, lastInvoice?: any, invoiceData?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const [formData, setFormData] = useState({
    roomId,
    billingMonth: invoiceData?.billingMonth || currentMonth,
    billingYear: invoiceData?.billingYear || currentYear,
    billDate: invoiceData?.billDate ? new Date(invoiceData.billDate).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
    checkIn: invoiceData?.checkIn ? new Date(invoiceData.checkIn).toISOString().substring(0, 10) : '',
    checkOut: invoiceData?.checkOut ? new Date(invoiceData.checkOut).toISOString().substring(0, 10) : '',
    oldElecMeter: invoiceData?.oldElecMeter ?? (lastInvoice?.newElecMeter || 0),
    newElecMeter: invoiceData?.newElecMeter ?? 0,
    oldElecMeterB: invoiceData?.oldElecMeterB ?? (lastInvoice?.newElecMeterB || 0),
    newElecMeterB: invoiceData?.newElecMeterB ?? 0,
    oldWaterMeter: invoiceData?.oldWaterMeter ?? (lastInvoice?.newWaterMeter || 0),
    newWaterMeter: invoiceData?.newWaterMeter ?? 0,
    rentTotal: invoiceData?.rentTotal ?? (roomData.rent || 0),
    note: invoiceData?.note || ''
  })

  const [customItems, setCustomItems] = useState<{name: string, amount: number}[]>(
    invoiceData?.customItems || []
  )

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
    
    // Auto calculate rentTotal for daily rooms if checkIn and checkOut are changed
    if (roomData.isDaily && (e.target.name === 'checkIn' || e.target.name === 'checkOut')) {
      const newFormData = { ...formData, [e.target.name]: value }
      if (newFormData.checkIn && newFormData.checkOut) {
        const d1 = new Date(newFormData.checkIn)
        const d2 = new Date(newFormData.checkOut)
        const diffTime = d2.getTime() - d1.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays > 0) {
          newFormData.rentTotal = diffDays * (roomData.rent || 0)
        } else {
          // If check-out is same day as check-in, consider it 1 day
          newFormData.rentTotal = roomData.rent || 0
        }
      }
      setFormData(newFormData)
    } else {
      setFormData({ ...formData, [e.target.name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...formData,
        customItems,
        billDate: new Date(formData.billDate)
      }
      if (invoiceData?.id) {
        await updateInvoiceDetails(invoiceData.id, payload)
        router.push(`/invoices/${invoiceData.id}`)
      } else {
        await createInvoice(payload)
        router.push(`/rooms/${roomId}`)
      }
      router.refresh()
    } catch (error) {
      console.error(error)
      alert(invoiceData ? 'เกิดข้อผิดพลาดในการแก้ไขบิล' : 'เกิดข้อผิดพลาดในการสร้างบิล')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <LoadingOverlay
        loading={loading}
        message={invoiceData?.id ? 'กำลังแก้ไขบิล...' : 'กำลังคำนวณและสร้างบิล...'}
        subMessage="กรุณารอสักครู่ ระบบกำลังประมวลผล"
      />
      <div className="grid grid-cols-2">
        
        <div>
          <label className="label">ประจำเดือน</label>
          <select name="billingMonth" value={formData.billingMonth} onChange={handleChange} className="input">
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>เดือน {i+1}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">ปี (ค.ศ.)</label>
          <input type="number" name="billingYear" value={formData.billingYear} onChange={handleChange} className="input" />
        </div>
        
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label">วันที่ออกบิล</label>
          <input type="date" name="billDate" value={formData.billDate} onChange={handleChange} className="input" />
        </div>

        {roomData.isDaily ? (
          <div style={{ gridColumn: '1 / -1', padding: '1.5rem', backgroundColor: '#faf5ff', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
            <h3 style={{ marginBottom: '1rem', color: '#581c87' }}>ห้องรายวัน</h3>
            <div className="grid grid-cols-2" style={{ marginBottom: '1rem' }}>
              <div>
                <label className="label" style={{ color: '#6b21a8' }}>วันที่ Check-in</label>
                <input type="date" name="checkIn" value={formData.checkIn} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label" style={{ color: '#6b21a8' }}>วันที่ Check-out</label>
                <input type="date" name="checkOut" value={formData.checkOut} onChange={handleChange} className="input" />
              </div>
            </div>
            <div>
              <label className="label" style={{ color: '#6b21a8' }}>ยอดรวมค่าเช่าที่จะเก็บ (บาท) {formData.checkIn && formData.checkOut && <span style={{fontSize: '0.8rem', fontWeight: 'normal'}}>(คำนวณอัตโนมัติจากจำนวนวัน)</span>}</label>
              <input type="number" name="rentTotal" value={formData.rentTotal} onChange={handleChange} className="input" required />
            </div>
          </div>
        ) : (
          <>
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>จดเลขมิเตอร์ไฟฟ้า</h3>
            </div>

            <div>
              <label className="label">เลขมิเตอร์ไฟ{roomData.elecMeterType === 'DOUBLE' ? ' A ' : ' '}เก่า</label>
              <input type="number" name="oldElecMeter" value={formData.oldElecMeter} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">เลขมิเตอร์ไฟ{roomData.elecMeterType === 'DOUBLE' ? ' A ' : ' '}ใหม่</label>
              <input type="number" name="newElecMeter" value={formData.newElecMeter} onChange={handleChange} className="input" required />
            </div>

            {roomData.elecMeterType === 'DOUBLE' && (
              <>
                <div>
                  <label className="label">เลขมิเตอร์ไฟ B เก่า</label>
                  <input type="number" name="oldElecMeterB" value={formData.oldElecMeterB} onChange={handleChange} className="input" required />
                </div>
                <div>
                  <label className="label">เลขมิเตอร์ไฟ B ใหม่</label>
                  <input type="number" name="newElecMeterB" value={formData.newElecMeterB} onChange={handleChange} className="input" required />
                </div>
              </>
            )}

            {(roomData.waterMeterType === 'UNIT' || roomData.waterMeterType === 'PERSON_MIN') && (
              <>
                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>จดเลขมิเตอร์น้ำ</h3>
                </div>
                <div>
                  <label className="label">เลขมิเตอร์น้ำเก่า</label>
                  <input type="number" name="oldWaterMeter" value={formData.oldWaterMeter} onChange={handleChange} className="input" required />
                </div>
                <div>
                  <label className="label">เลขมิเตอร์น้ำใหม่</label>
                  <input type="number" name="newWaterMeter" value={formData.newWaterMeter} onChange={handleChange} className="input" required />
                </div>
              </>
            )}

            {roomData.waterMeterType === 'FLAT' && (
              <div style={{ gridColumn: '1 / -1', padding: '1rem', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <p>ห้องนี้ใช้น้ำแบบเหมาจ่าย ({roomData.waterFlatRate} บาท) ไม่ต้องจดเลขมิเตอร์น้ำ</p>
              </div>
            )}
          </>
        )}

        <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--primary-color)', margin: 0 }}>รายการเพิ่มเติม (เช่น ค่าปรับ, ค่าซ่อม)</h3>
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
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>ไม่มีรายการเพิ่มเติม</p>
          )}
        </div>

        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
          <label className="label">หมายเหตุในบิล (ถ้ามี)</label>
          <textarea name="note" value={formData.note} onChange={handleChange} className="input" rows={2} />
        </div>
        
      </div>
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button type="button" onClick={() => router.back()} className="btn btn-outline">ยกเลิก</button>
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {loading && <span className="btn-spinner" />}
          {loading ? 'กำลังสร้างบิล...' : 'สร้างบิลค่าเช่า'}
        </button>
      </div>
    </form>
  )
}
