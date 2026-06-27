'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createApartment, updateApartment, deleteApartment } from '@/actions/apartment'
import { uploadImage } from '@/actions/upload'
import Image from 'next/image'
import LoadingOverlay from './LoadingOverlay'

export default function ApartmentForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    ownerName: initialData?.ownerName || '',
    ownerPhone: initialData?.ownerPhone || '',
    address: initialData?.address || '',
    bankName: initialData?.bankName || '',
    bankAccountName: initialData?.bankAccountName || '',
    bankAccountNumber: initialData?.bankAccountNumber || '',
    billNote: initialData?.billNote || '',
    qrCodeUrl: initialData?.qrCodeUrl || '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(initialData?.qrCodeUrl || null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0]
      setFile(f)
      setPreview(URL.createObjectURL(f))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let qrCodeUrl = formData.qrCodeUrl
      if (file) {
        const uploadData = new FormData()
        uploadData.append('file', file)
        qrCodeUrl = await uploadImage(uploadData)
      }

      const payload = { ...formData, qrCodeUrl }

      if (initialData?.id) {
        await updateApartment(initialData.id, payload)
      } else {
        await createApartment(payload)
      }
      router.push('/')
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
        message={initialData?.id ? 'กำลังบันทึกข้อมูลหอพัก...' : 'กำลังสร้างหอพักใหม่...'}
        subMessage="กรุณารอสักครู่"
      />
      <div className="grid grid-cols-2">
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label">ชื่อหอพัก *</label>
          <input required name="name" value={formData.name} onChange={handleChange} className="input" />
        </div>
        <div>
          <label className="label">ชื่อเจ้าของ/ผู้ดูแล</label>
          <input name="ownerName" value={formData.ownerName} onChange={handleChange} className="input" />
        </div>
        <div>
          <label className="label">เบอร์โทรติดต่อ</label>
          <input name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} className="input" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label">ที่อยู่หอพัก</label>
          <textarea name="address" value={formData.address} onChange={handleChange} className="input" rows={2} />
        </div>

        <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>ข้อมูลรับชำระเงิน</h3>
        </div>

        <div>
          <label className="label">ธนาคาร</label>
          <input name="bankName" value={formData.bankName} onChange={handleChange} className="input" />
        </div>
        <div>
          <label className="label">ชื่อบัญชี</label>
          <input name="bankAccountName" value={formData.bankAccountName} onChange={handleChange} className="input" />
        </div>
        <div>
          <label className="label">เลขบัญชี</label>
          <input name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} className="input" />
        </div>
        
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label">อัปโหลดรูป QR Code รับชำระเงิน (ถ้ามี)</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="input" style={{ padding: '0.5rem' }} />
          {preview && (
            <div style={{ marginTop: '1rem' }}>
              <img src={preview} alt="QR Code" width={150} height={150} style={{ objectFit: 'contain', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
            </div>
          )}
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label">หมายเหตุแนบท้ายบิล</label>
          <textarea name="billNote" value={formData.billNote} onChange={handleChange} className="input" rows={3} placeholder="เช่น ค่าน้ำขั้นต่ำ 100 บาท/คน" />
        </div>
      </div>
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {initialData?.id && (
            <button 
              type="button" 
              onClick={async () => {
                if (confirm('คุณแน่ใจหรือไม่ว่าจะลบหอพักนี้? ข้อมูลห้องพักและบิลทั้งหมดจะถูกลบไปด้วยและไม่สามารถกู้คืนได้')) {
                  setLoading(true)
                  try {
                    await deleteApartment(initialData.id)
                    router.push('/')
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
              🗑️ ลบหอพัก
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
