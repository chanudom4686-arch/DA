'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createInvoice } from '@/actions/invoice'
import LoadingOverlay from './LoadingOverlay'

export default function FastBillingView({ rooms }: { rooms: any[] }) {
  const router = useRouter()
  
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // Global Settings State
  const [globalDate, setGlobalDate] = useState(new Date().toISOString().substring(0, 10))

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(rooms.length > 0 ? rooms[0].id : null)
  const [loading, setLoading] = useState(false)

  // Form State for the currently selected room
  const [formData, setFormData] = useState<any>({})

  const formRef = useRef<HTMLFormElement>(null)

  // Prevent wheel scroll on number inputs
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (document.activeElement && (document.activeElement as HTMLInputElement).type === 'number') {
        (document.activeElement as HTMLElement).blur();
      }
    }
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  // When selected room changes, initialize form data
  useEffect(() => {
    if (!selectedRoomId) return
    const room = rooms.find(r => r.id === selectedRoomId)
    if (!room) return

    const lastInvoice = room.invoices?.[0]

    setFormData({
      roomId: room.id,
      billDate: globalDate,
      checkIn: '',
      checkOut: '',
      oldElecMeter: lastInvoice?.newElecMeter || 0,
      newElecMeter: '', // Empty ready to be typed
      oldElecMeterB: lastInvoice?.newElecMeterB || 0,
      newElecMeterB: '',
      oldWaterMeter: lastInvoice?.newWaterMeter || 0,
      newWaterMeter: '',
      rentTotal: room.rent || 0,
      note: ''
    })
  }, [selectedRoomId]) // We intentionally don't add globals here so changing global doesn't overwrite active form

  // When global changes, update current form data if it matches current room
  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      billDate: globalDate
    }))
  }, [globalDate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' && e.target.value !== '' ? parseFloat(e.target.value) : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault()
      // If it's the submit button or last field, submit form
      // Otherwise, we just submit the form if it's valid
      if (formRef.current?.checkValidity()) {
        handleSubmit(e as any)
      } else {
        formRef.current?.reportValidity()
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoomId) return

    setLoading(true)
    try {
      const billDateObj = new Date(formData.billDate)
      const payload = {
        ...formData,
        billDate: billDateObj,
        billingMonth: billDateObj.getMonth() + 1,
        billingYear: billDateObj.getFullYear(),
        newElecMeter: formData.newElecMeter === '' ? 0 : parseFloat(formData.newElecMeter),
        newElecMeterB: formData.newElecMeterB === '' ? 0 : parseFloat(formData.newElecMeterB),
        newWaterMeter: formData.newWaterMeter === '' ? 0 : parseFloat(formData.newWaterMeter),
      }
      
      await createInvoice(payload)
      
      // Select next room
      const currentIndex = rooms.findIndex(r => r.id === selectedRoomId)
      if (currentIndex < rooms.length - 1) {
        setSelectedRoomId(rooms[currentIndex + 1].id)
      } else {
        alert('บันทึกข้อมูลครบทุกห้องแล้ว')
      }
      
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('เกิดข้อผิดพลาดในการสร้างบิล')
    } finally {
      setLoading(false)
    }
  }

  const activeRoom = rooms.find(r => r.id === selectedRoomId)

  return (
    <div>
      {/* Global Settings */}
      <div className="card" style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
        <h3 style={{ marginBottom: '1rem', color: '#6b21a8', fontSize: '1rem' }}>⚙️ ตั้งค่าวันที่ออกบิลสำหรับรอบนี้</h3>
        <div style={{ maxWidth: '300px' }}>
          <input type="date" value={globalDate} onChange={(e) => setGlobalDate(e.target.value)} className="input" style={{ padding: '0.5rem' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left Side: Room List */}
        <div className="card" style={{ flex: '1', padding: '1rem', maxHeight: '70vh', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '1rem' }}>รายชื่อห้อง ({rooms.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {rooms.map(room => (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: selectedRoomId === room.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                  backgroundColor: selectedRoomId === room.id ? '#faf5ff' : 'white',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: selectedRoomId === room.id ? 'bold' : 'normal'
                }}
              >
                <span>ห้อง {room.name} {room.isDaily ? '(รายวัน)' : ''}</span>
                {/* Could add a badge here if a bill already exists for the global month/year, but keeping it simple for now */}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="card" style={{ flex: '2', padding: '2rem' }}>
          {activeRoom ? (
            <form ref={formRef} onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
              <LoadingOverlay
                loading={loading}
                message="กำลังบันทึกบิล..."
                subMessage="กำลังบันทึกข้อมูลและเตรียมสึบห้องถัดไป"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  กำลังคีย์บิล: ห้อง {activeRoom.name}
                </h2>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  สามารถกดปุ่ม <kbd style={{ padding: '0.2rem 0.4rem', background: '#f1f5f9', borderRadius: '4px', border: '1px solid #cbd5e1' }}>Enter</kbd> เพื่อเซฟและข้ามห้อง
                </div>
              </div>

              <div className="grid grid-cols-1" style={{ gap: '1rem' }}>
                {/* Per-bill date override */}
                <div style={{ maxWidth: '300px' }}>
                  <label className="label">วันที่ออกบิล (เฉพาะห้องนี้)</label>
                  <input type="date" name="billDate" value={formData.billDate || ''} onChange={handleChange} className="input" />
                </div>

                {activeRoom.isDaily ? (
                  <div style={{ gridColumn: '1 / -1', padding: '1rem', backgroundColor: '#faf5ff', borderRadius: '8px' }}>
                     <label className="label">ยอดรวมค่าเช่าที่จะเก็บ (บาท)</label>
                     <input type="number" name="rentTotal" value={formData.rentTotal} onChange={handleChange} className="input" required autoFocus />
                  </div>
                ) : (
                  <>
                    {/* Electricity */}
                    <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                      <h3 style={{ fontSize: '1rem', color: '#475569', marginBottom: '0.5rem' }}>มิเตอร์ไฟฟ้า {activeRoom.elecMeterType === 'DOUBLE' ? '(A)' : ''}</h3>
                      <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                        <div>
                          <label className="label">เลขเก่า (ยอดยกมา)</label>
                          <input type="number" name="oldElecMeter" value={formData.oldElecMeter} onChange={handleChange} className="input" required />
                        </div>
                        <div>
                          <label className="label" style={{ color: 'var(--primary-color)' }}>เลขใหม่ (จดวันนี้)</label>
                          <input type="number" name="newElecMeter" value={formData.newElecMeter} onChange={handleChange} className="input" required autoFocus />
                        </div>
                      </div>
                    </div>

                    {activeRoom.elecMeterType === 'DOUBLE' && (
                      <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', color: '#475569', marginBottom: '0.5rem' }}>มิเตอร์ไฟฟ้า (B)</h3>
                        <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                          <div>
                            <label className="label">เลขเก่า B</label>
                            <input type="number" name="oldElecMeterB" value={formData.oldElecMeterB} onChange={handleChange} className="input" required />
                          </div>
                          <div>
                            <label className="label" style={{ color: 'var(--primary-color)' }}>เลขใหม่ B</label>
                            <input type="number" name="newElecMeterB" value={formData.newElecMeterB} onChange={handleChange} className="input" required />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Water */}
                    {(activeRoom.waterMeterType === 'UNIT' || activeRoom.waterMeterType === 'PERSON_MIN') && (
                      <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', color: '#475569', marginBottom: '0.5rem' }}>มิเตอร์น้ำประปา</h3>
                        <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                          <div>
                            <label className="label">เลขเก่า (ยอดยกมา)</label>
                            <input type="number" name="oldWaterMeter" value={formData.oldWaterMeter} onChange={handleChange} className="input" required />
                          </div>
                          <div>
                            <label className="label" style={{ color: 'var(--primary-color)' }}>เลขใหม่ (จดวันนี้)</label>
                            <input type="number" name="newWaterMeter" value={formData.newWaterMeter} onChange={handleChange} className="input" required />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                  <label className="label">หมายเหตุ (ถ้ามี)</label>
                  <input type="text" name="note" value={formData.note || ''} onChange={handleChange} className="input" />
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {loading && <span className="btn-spinner" />}
                  {loading ? 'กำลังบันทึก...' : 'บันทึก & ถัดไป ➡️'}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
              กรุณาเลือกห้องพักจากรายการด้านซ้ายเพื่อเริ่มจดบิล
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
