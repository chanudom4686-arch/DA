'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRoom, updateRoom, deleteRoom } from '@/actions/room'
import LoadingOverlay from './LoadingOverlay'

export default function RoomForm({ apartmentId, initialData }: { apartmentId: string, initialData?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    apartmentId,
    name: initialData?.name || '',
    status: initialData?.status || 'AVAILABLE',
    isDaily: initialData?.isDaily || false,
    rent: initialData?.rent || 0,
    commonFee: initialData?.commonFee || 0,
    elecMeterType: initialData?.elecMeterType || 'SINGLE',
    waterMeterType: initialData?.waterMeterType || 'UNIT',
    occupantsCount: initialData?.occupantsCount || 1,
    elecRate: initialData?.elecRate || 0,
    waterRate: initialData?.waterRate || 0,
    waterMinCharge: initialData?.waterMinCharge || 0,
    waterFlatRate: initialData?.waterFlatRate || 0,
    paymentDate: initialData?.paymentDate || 1,
    note: initialData?.note || '',
    tenantName: initialData?.tenantName || '',
    tenantPhone: initialData?.tenantPhone || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.type === 'number' 
        ? parseFloat(e.target.value) || 0 
        : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (initialData?.id) {
        await updateRoom(initialData.id, formData)
      } else {
        await createRoom(formData)
      }
      router.push(initialData?.id ? `/rooms/${initialData.id}` : `/apartments/${apartmentId}`)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <LoadingOverlay
        loading={loading}
        message={initialData?.id ? 'กำลังบันทึกข้อมูลห้อง...' : 'กำลังสร้างห้องใหม่...'}
        subMessage="กรุณารอสักครู่"
      />
      <div className="grid grid-cols-2">
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label">ชื่อ/เลขห้อง *</label>
          <input required name="name" value={formData.name} onChange={handleChange} className="input" />
        </div>
        
        <div>
          <label className="label">ประเภทการเช่า</label>
          <select name="isDaily" value={formData.isDaily ? 'true' : 'false'} onChange={(e) => setFormData({...formData, isDaily: e.target.value === 'true'})} className="input">
            <option value="false">รายเดือน</option>
            <option value="true">รายวัน</option>
          </select>
        </div>
        <div>
          <label className="label">สถานะห้อง</label>
          <select name="status" value={formData.status} onChange={handleChange} className="input">
            <option value="AVAILABLE">ว่าง</option>
            <option value="OCCUPIED">มีผู้เช่า</option>
            <option value="MAINTENANCE">ซ่อมบำรุง</option>
          </select>
        </div>

        {formData.status === 'OCCUPIED' && (
          <>
            <div>
              <label className="label">ชื่อผู้เช่า</label>
              <input name="tenantName" value={formData.tenantName} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">เบอร์โทรผู้เช่า</label>
              <input name="tenantPhone" value={formData.tenantPhone} onChange={handleChange} className="input" />
            </div>
          </>
        )}

        <div>
          <label className="label">ค่าเช่าห้อง (บาท)</label>
          <input type="number" name="rent" value={formData.rent} onChange={handleChange} className="input" />
        </div>
        <div>
          <label className="label">ค่าส่วนกลาง (บาท)</label>
          <input type="number" name="commonFee" value={formData.commonFee} onChange={handleChange} className="input" />
        </div>

        <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>ตั้งค่ามิเตอร์และการคำนวณ</h3>
        </div>

        <div>
          <label className="label">ประเภทมิเตอร์ไฟ</label>
          <select name="elecMeterType" value={formData.elecMeterType} onChange={handleChange} className="input">
            <option value="SINGLE">มิเตอร์เดียว</option>
            <option value="DOUBLE">2 มิเตอร์ (A และ B)</option>
          </select>
        </div>
        <div>
          <label className="label">ค่าไฟ (บาท/หน่วย)</label>
          <input type="number" name="elecRate" value={formData.elecRate} onChange={handleChange} className="input" />
        </div>

        <div>
          <label className="label">ประเภทมิเตอร์น้ำ</label>
          <select name="waterMeterType" value={formData.waterMeterType} onChange={handleChange} className="input">
            <option value="UNIT">คิดตามหน่วย</option>
            <option value="FLAT">เหมาจ่าย</option>
            <option value="PERSON_MIN">ขั้นต่ำต่อคน</option>
          </select>
        </div>

        {formData.waterMeterType === 'FLAT' && (
          <div>
            <label className="label">ค่าน้ำเหมาจ่าย (บาท)</label>
            <input type="number" name="waterFlatRate" value={formData.waterFlatRate} onChange={handleChange} className="input" />
          </div>
        )}

        {(formData.waterMeterType === 'UNIT' || formData.waterMeterType === 'PERSON_MIN') && (
          <div>
            <label className="label">ค่าน้ำ (บาท/หน่วย)</label>
            <input type="number" name="waterRate" value={formData.waterRate} onChange={handleChange} className="input" />
          </div>
        )}

        {formData.waterMeterType === 'PERSON_MIN' && (
          <>
            <div>
              <label className="label">ค่าน้ำขั้นต่ำต่อคน (บาท)</label>
              <input type="number" name="waterMinCharge" value={formData.waterMinCharge} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">จำนวนผู้พักอาศัย (คน)</label>
              <input type="number" name="occupantsCount" value={formData.occupantsCount} onChange={handleChange} className="input" />
            </div>
          </>
        )}

        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label">ชำระทุกวันที่</label>
          <input type="number" name="paymentDate" value={formData.paymentDate} onChange={handleChange} className="input" placeholder="เช่น 1 หรือ 5" />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label">หมายเหตุห้องพัก</label>
          <textarea name="note" value={formData.note} onChange={handleChange} className="input" rows={2} />
        </div>

      </div>
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {initialData?.id && (
            <button 
              type="button" 
              onClick={async () => {
                if (confirm('คุณแน่ใจหรือไม่ว่าจะลบห้องพักนี้? ข้อมูลบิลทั้งหมดของห้องนี้จะถูกลบไปด้วยและไม่สามารถกู้คืนได้')) {
                  setLoading(true)
                  try {
                    await deleteRoom(initialData.id, apartmentId)
                    router.push(`/apartments/${apartmentId}`)
                    router.refresh()
                  } catch (error) {
                    alert('เกิดข้อผิดพลาดในการลบ')
                    setLoading(false)
                  }
                }
              }}
              className="btn btn-outline" 
              style={{ borderColor: '#ef4444', color: '#ef4444' }}
              disabled={loading}
            >
              🗑️ ลบห้องพัก
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="button" onClick={() => router.back()} className="btn btn-outline">ยกเลิก</button>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {loading && <span className="btn-spinner" />}
            {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>
      </div>
    </form>
  )
}
