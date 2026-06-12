import { getApartments } from '@/actions/apartment'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const apartments = await getApartments()

  return (
    <div>
      <div className="header">
        <div>
          <h1 className="title">ภาพรวมระบบ (Dashboard)</h1>
          <p className="subtitle">ยินดีต้อนรับสู่ระบบจัดการหอพัก</p>
        </div>
        <Link href="/apartments/new" className="btn btn-primary">
          + เพิ่มหอพักใหม่
        </Link>
      </div>

      <div className="grid grid-cols-2">
        {apartments.map((apt) => (
          <Link key={apt.id} href={`/apartments/${apt.id}`} className="card" style={{ display: 'block' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-color)' }}>
              {apt.name}
            </h2>
            <div style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
              <p>ผู้ดูแล: {apt.ownerName || '-'}</p>
              <p>เบอร์โทร: {apt.ownerPhone || '-'}</p>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <span className="btn btn-outline" style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}>
                จัดการห้องพัก &rarr;
              </span>
            </div>
          </Link>
        ))}

        {apartments.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>ยังไม่มีข้อมูลหอพักในระบบ</p>
          </div>
        )}
      </div>
    </div>
  )
}
