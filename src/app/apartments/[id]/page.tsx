import { getApartment, getApartments } from '@/actions/apartment'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ApartmentSwitcher from '@/components/ApartmentSwitcher'

export default async function ApartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const apt = await getApartment(id)
  
  if (!apt) {
    notFound()
  }

  const allApts = await getApartments()

  return (
    <div>
      <div className="header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 className="title">{apt.name}</h1>
            <ApartmentSwitcher apartments={allApts} currentId={apt.id} />
          </div>
          <p className="subtitle">ข้อมูลหอพักและห้องพักทั้งหมด</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href={`/apartments/${apt.id}/fast-billing`} className="btn" style={{ backgroundColor: '#a855f7', color: 'white', borderColor: '#a855f7' }}>
            ⚡ จดบิลด่วน
          </Link>
          <Link href={`/apartments/${apt.id}/edit`} className="btn btn-outline">
            แก้ไขข้อมูลหอพัก
          </Link>
          <Link href={`/apartments/${apt.id}/rooms/new`} className="btn btn-primary">
            + เพิ่มห้องพัก
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>ข้อมูลติดต่อ</h3>
          <p><strong>ผู้ดูแล:</strong> {apt.ownerName || '-'}</p>
          <p><strong>เบอร์โทร:</strong> {apt.ownerPhone || '-'}</p>
          <p><strong>ที่อยู่:</strong> {apt.address || '-'}</p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>ข้อมูลรับชำระเงิน</h3>
          <p><strong>ธนาคาร:</strong> {apt.bankName || '-'}</p>
          <p><strong>ชื่อบัญชี:</strong> {apt.bankAccountName || '-'}</p>
          <p><strong>เลขบัญชี:</strong> {apt.bankAccountNumber || '-'}</p>
        </div>
      </div>

      {/* ห้องรายเดือน */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', marginTop: '2rem' }}>
        <h2 className="title" style={{ fontSize: '1.5rem' }}>ห้องพักรายเดือน ({apt.rooms.filter(r => !r.isDaily).length})</h2>
      </div>
      
      <div className="grid grid-cols-4">
        {apt.rooms.filter(r => !r.isDaily).map((room) => (
          <Link key={room.id} href={`/rooms/${room.id}`} className="card" style={{ display: 'block' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>ห้อง {room.name}</h3>
              <span style={{ 
                fontSize: '0.75rem', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '1rem',
                backgroundColor: room.status === 'AVAILABLE' ? '#dcfce7' : '#f1f5f9',
                color: room.status === 'AVAILABLE' ? '#166534' : '#475569',
              }}>
                {room.status === 'AVAILABLE' ? 'ว่าง' : 'ไม่ว่าง'}
              </span>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p>ค่าเช่า: {room.rent} บ.</p>
            </div>
          </Link>
        ))}
        {apt.rooms.filter(r => !r.isDaily).length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            ไม่มีห้องพักรายเดือน
          </div>
        )}
      </div>

      {/* ห้องรายวัน */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', marginTop: '3rem' }}>
        <h2 className="title" style={{ fontSize: '1.5rem', color: '#6b21a8' }}>ห้องพักรายวัน ({apt.rooms.filter(r => r.isDaily).length})</h2>
      </div>
      
      <div className="grid grid-cols-4">
        {apt.rooms.filter(r => r.isDaily).map((room) => (
          <Link key={room.id} href={`/rooms/${room.id}`} className="card" style={{ display: 'block', borderLeft: '4px solid #a855f7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#6b21a8' }}>ห้อง {room.name}</h3>
              <span style={{ 
                fontSize: '0.75rem', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '1rem',
                backgroundColor: room.status === 'AVAILABLE' ? '#dcfce7' : '#f1f5f9',
                color: room.status === 'AVAILABLE' ? '#166534' : '#475569',
              }}>
                {room.status === 'AVAILABLE' ? 'ว่าง' : 'ไม่ว่าง'}
              </span>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p>เรทค่าเช่า: {room.rent} บ./วัน</p>
            </div>
          </Link>
        ))}
        {apt.rooms.filter(r => r.isDaily).length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            ไม่มีห้องพักรายวัน
          </div>
        )}
      </div>
    </div>
  )
}
